# wiki-API

This project provides a RESTful API for managing articles using Node.js and Express. It utilizes MongoDB as the database for storing article data. The API supports CRUD (Create, Read, Update, Delete) operations on articles.

## Stack and Tools

- Node.js
- Express
- MongoDB
- Mongoose
- Winston
- body-parser
- ejs

## Usage

1. Install dependencies: `npm install`
2. Start MongoDB server
3. Start the application: `node app.js` or `npm start`
4. Access API endpoints using tools like cURL or Postman

## API Endpoints

- `GET /articles`: Retrieves all articles
- `POST /articles`: Creates a new article
- `DELETE /articles`: Deletes all articles
- `GET /articles/:title`: Retrieves a specific article by title
- `PUT /articles/:title`: Updates a specific article by title (replaces the entire article)
- `PATCH /articles/:title`: Updates a specific article by title (partially updates the article)
- `DELETE /articles/:title`: Deletes a specific article by title

## Error Handling

- Errors are logged and return a 500 (Internal Server Error) response.

## Logging

- Winston is used for logging to console and log files.

## Configuration

- MongoDB connection string: `mongodb://127.0.0.1:27017/wikiDB`

## License

- MIT License

