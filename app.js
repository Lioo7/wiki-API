const express = require('express');
const bodyParser = require('body-parser');
// eslint-disable-next-line no-unused-vars
const ejs = require('ejs');
const mongoose = require('mongoose');
const winston = require('winston');

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

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1:27017/wikiDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Failed to connect to MongoDB:', error);
  });

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Article = mongoose.model('Article', articleSchema);

app.route('/articles')

  .get(async (req, res) => {
    try {
      const articles = await Article.find();
      if (articles.length > 0) {
        logger.info('Article found');
        res.send(articles);
      } else {
        logger.error('No articles found');
        res.status(404).send('No articles found');
      }
    } catch (error) {
      logger.error('Failed to retrieve articles:', error);
      res.status(500).send('Internal Server Error');
    }
  })

  .post(async (req, res) => {
    try {
      const newArticle = new Article({
        title: req.body.title,
        content: req.body.content,
      });
      const article = await newArticle.save();
      logger.info(`Article: ${article} saved successfully`);
      res.status(200).json({ message: 'Article saved successfully' });
    } catch (error) {
      logger.error(`Error occurred while attempting to save the article: ${error.message}`);
      res.status(500).json({ error: 'Failed to save the article' });
    }
  })

  .delete(async (req, res) => {
    try {
      await Article.deleteMany();
      logger.info('Successfully deleted all articles');
      res.send('Successfully deleted all articles');
    } catch (error) {
      logger.error(`Error occurred while attempting to delete the articles: ${error.message}`);
      res.status(500).json({ error: 'Failed to delete the articles' });
    }
  });

app.route('/articles/:title')
  .get(async (req, res) => {
    try {
      const foundArticle = await Article.findOne({ title: req.params.title });
      if (foundArticle) {
        logger.info('Article found');
        res.send(foundArticle);
      } else {
        logger.error(`${req.params.title} article was not found`);
        res.status(404).send('No articles found');
      }
    } catch (error) {
      logger.error('Failed to retrieve the article:', error);
      res.status(500).send('Internal Server Error');
    }
  })

  .put(async (req, res) => {
    try {
      const { title, content } = req.body; // Validate input data
      const filter = { title: req.params.title }; // Filter condition
      const update = { title, content }; // Updated fields

      const updatedArticle = await Article.replaceOne(filter, update);

      if (updatedArticle.modifiedCount > 0) {
        logger.info('Article updated successfully');
        res.status(200).json({ message: 'Article updated successfully' });
      } else {
        logger.error(`${req.params.title} article was not found`);
        res.status(404).json({ error: 'No articles found' });
      }
    } catch (error) {
      logger.error('Failed to retrieve and update the article:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .patch()
  .delete();

app.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});
