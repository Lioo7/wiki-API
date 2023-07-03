const express = require('express');
const bodyParser = require('body-parser');
// eslint-disable-next-line no-unused-vars
const ejs = require('ejs');
const mongoose = require('mongoose');
const winston = require('winston');

const app = express();
const port = 3000;

// Dependencies
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/wikiDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Failed to connect to MongoDB:', error);
  });

// Article Schema
const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Article = mongoose.model('Article', articleSchema);

// Route Handlers
app.get('/test', (req, res, next) => {
  try {
    // Simulate an error
    throw new Error('This is a test error');
    // ... other code ...
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

app.route('/articles')

  .get(async (req, res, next) => {
    try {
      const articles = await Article.find();
      if (articles.length > 0) {
        logger.info('Articles found');
        res.json(articles);
      } else {
        logger.error('No articles found');
        res.status(404).json({ error: 'No articles found' });
      }
    } catch (error) {
      next(error);
    }
  })

  .post(async (req, res, next) => {
    try {
      const { title, content } = req.body;
      const newArticle = new Article({ title, content });
      const article = await newArticle.save();
      logger.info(`Article: ${article} saved successfully`);
      res.status(200).json({ message: 'Article saved successfully' });
    } catch (error) {
      next(error);
    }
  })

  .delete(async (req, res, next) => {
    try {
      const { deletedCount } = await Article.deleteMany();
      logger.info(`Successfully deleted ${deletedCount} articles`);
      res.status(204).json({ message: 'Successfully deleted all articles' });
    } catch (error) {
      next(error);
    }
  });

app.route('/articles/:title')

  .get(async (req, res, next) => {
    try {
      const foundArticle = await Article.findOne({ title: req.params.title });
      if (foundArticle) {
        logger.info('Article found');
        res.json(foundArticle);
      } else {
        logger.error(`${req.params.title} article was not found`);
        res.status(404).json({ error: 'No articles found' });
      }
    } catch (error) {
      next(error);
    }
  })

  .put(async (req, res, next) => {
    try {
      const { title, content } = req.body;
      const filter = { title: req.params.title };
      const update = { title, content };
      const updatedArticle = await Article.replaceOne(filter, update);
      if (updatedArticle.modifiedCount > 0) {
        logger.info('Article updated successfully');
        res.json({ message: 'Article updated successfully' });
      } else {
        logger.error(`${req.params.title} article was not found`);
        res.status(404).json({ error: 'No articles found' });
      }
    } catch (error) {
      next(error);
    }
  })

  .patch(async (req, res, next) => {
    try {
      const filter = { title: req.params.title };
      const update = { $set: req.body };
      const updatedArticle = await Article.findOneAndUpdate(filter, update);
      if (updatedArticle) {
        logger.info('Article updated successfully');
        res.json({ message: 'Article updated successfully' });
      } else {
        logger.error(`${req.params.title} article was not found`);
        res.status(404).json({ error: 'No articles found' });
      }
    } catch (error) {
      next(error);
    }
  })

  .delete(async (req, res, next) => {
    try {
      const { title } = req.params;
      const deletedFile = await Article.deleteOne({ title });
      if (deletedFile.deletedCount > 0) {
        logger.info(`Successfully deleted the article ${title}`, deletedFile);
        res.json({ message: `Successfully deleted the article ${title}` });
      } else {
        logger.error(`${title} article was not found`);
        res.status(404).json({ error: 'No articles found' });
      }
    } catch (error) {
      next(error);
    }
  });

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('An error occurred:', err);
  res.status(500).json({ error: 'Internal Server Error' });
  next(err); // Pass the error to the next middleware/error handler
});

// Start the server
app.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});
