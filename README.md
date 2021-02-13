# Rate Limit Server by NodeJS

An [Express](https://github.com/expressjs/express) server enables rate limiting. You can choose the algorithm behind rate limit, `Sliding Window` algorithm or `Fixed Window` algorithm by your preference.

## Get Started

### Execute the Code on Local without Docker
#### Requirements
* NodeJS > `v14.15.1`
* NPM > `v6.11.2`
* Redis > `v3.2`

#### Commands on Bash
```sh
$ # Running a redis server on your local. (Note that the data behind the redis server must be only for test purpose)

$ npm install
$ REDIS_URL=redis://localhost:6379 node index.js

$ # And try `curl localhost:5000`, if you have installed the 'curl' on your machine.
```

### Execute the Code on Local with Docker Compose
#### Requirements
* Docker
* Docker Compose

#### Commands on Bash
```sh
$ docker-compose up -d
```

### Choose the Algorithm behind Rate Limit
In `index.js` file, set assigned rate limit algorithm of express to **Sliding Window** by the code below.
```
app.set('rate_limit_algorithm', 'sliding_window');
```

In `index.js` file, set assigned rate limit algorithm of express to **Fixed Window** by the code below.
```
app.set('rate_limit_algorithm', 'fixed_window');
```

If you do not set the algorithm, system will apply **Fixed Window** algorithm as default rate limit setting.

### Testing
#### Requirements
* NodeJS > `v14.15.1`
* NPM > `v6.11.2`
* Redis > `v3.2`

#### Commands on Bash
```sh
$ # Running a redis server on your local. (Note that the data behind the redis server must be only for test purpose)
$ # Configure the "REDIS_URL" environment variable in the "config/test.json" file

$ npm install
$ npm run test
```

## Deploy to the Heroku
### Requirements
* Docker
* Heroku CLI with set up configuration

### Commands on Bash
```sh
$ heroku create # Create a Heroku app

$ heroku addons:create heroku-redis:hobby-dev # Create a free redis addon on the app

$ heroku container:login
$ heroku container:push web --recursive
$ heroku container:release web
$ heroku open
```

## License
[MIT](./LICENSE)