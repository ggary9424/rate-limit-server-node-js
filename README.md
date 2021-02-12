Rate Limit Server by NodeJS

## How to Execute the Code?

### On Local without Docker
#### Requirements
* NodeJS > v14.15.1
* NPM > v6.11.2
* Redis > v3.2

#### Commands on Bash
```sh
$ # Running a redis server on your local. (Note that the data behind the redis server must be for test purpose)

$ npm install
$ REDIS_URL=redis://localhost:6379 node index.js

$ # And try curl localhost:5000 if you have installed the 'curl' on your machine.
```

### On Local with Docker
#### Requirements
* Docker
* Docker Compose

#### Commands on Bash
```sh
$ docker-compose up -d
```

## Deploy to the Heroku
### Requirements
* Docker
* Heroku CLI with basic configuration

### Commands on Bash
```sh
$ heroku create # Create a Heroku app

$ heroku addons:create heroku-redis:hobby-dev # Create a free redis addon on the app

$ heroku container:login
$ heroku container:push web --recursive
$ heroku container:release web
$ heroku open
```