if (window.fixtures === undefined) {
  window.fixtures = {};
}

window.fixtures.fullDoc = {
  "_links": {
    "self": {
      "href": "/"
    },
    "curies": [
      {
        "name": "ht",
        "href": "http://haltalk.herokuapp.com/rels/{rel}",
        "templated": true
      }
    ],
    "ht:users": {
      "href": "/users"
    },
    "ht:signup": {
      "href": "/signup"
    },
    "ht:me": {
      "href": "/users/{name}",
      "templated": true
    },
    "ht:latest-posts": {
      "href": "/posts/latest"
    }
  },
  "_embedded": {
    "ht:post": [{
      "_links": {
        "self": {
          "href": "/posts/4ff8b9b52e95950002000004"
        },
        "ht:author": {
          "href": "/users/mamund",
          "title": "Mike Amundsen"
        }
      },
      "content": "having fun w/ the HAL Talk explorer",
      "created_at": "2012-07-07T22:35:33+00:00"
    }, {
      "_links": {
        "self": {
          "href": "/posts/4ff9331ee85ace0002000001"
        },
        "ht:author": {
          "href": "/users/mike",
          "title": "Mike Kelly"
        },
        "ht:in-reply-to": {
          "href": "/posts/4ff8b9b52e95950002000004"
        }
      },
      "content": "Awesome! Good too see someone figured out how to post something!! ;)",
      "created_at": "2012-07-08T07:13:34+00:00"
    }]
  },
  "welcome": "Welcome to a haltalk server.",
  "hint_1": "You need an account to post stuff..",
  "hint_2": "Create one by POSTing via the ht:signup link..",
  "hint_3": "Click the orange buttons on the right to make POST requests..",
  "hint_4": "Click the green button to follow a link with a GET request..",
  "hint_5": "Click the book icon to read docs for the link relation."
};

window.fixtures.subDoc = {
  "_links": {
    "self": {
      "href": "/posts/4ff8b9b52e95950002000004"
    },
    "ht:author": {
      "href": "/users/mamund",
      "title": "Mike Amundsen"
    }
  },
  "content": "having fun w/ the HAL Talk explorer",
  "created_at": "2012-07-07T22:35:33+00:00"
};

window.fixtures.embeddedOrders = {
  "_links": {
    "self": { "href": "/orders" },
  },
  "_embedded": {
   "orders": [{
       "_links": {
         "self": { "href": "/orders/123" },
         "basket": { "href": "/baskets/98712" },
         "customer": { "href": "/customers/7809" }
       },
       "total": 30.00,
       "currency": "USD",
       "status": "shipped",
     }, {
       "_links": {
         "self": { "href": "/orders/124" },
         "basket": { "href": "/baskets/97213" },
         "customer": { "href": "/customers/12369" }
       },
       "total": 20.00,
       "currency": "USD",
       "status": "processing"
    }],
  "single": {
    "_links": {
      "self": { "href": "/self/" }
    },
    "title": "yours truly"
  }
  }
};

window.fixtures.recursiveEmbed = {
  "_links": {
    "self": { "href": "/orders" },
  },
  "_embedded": {
    "single": {
      "_links": {
        "self": { "href": "/self/" }
      },
      "_embedded": {
        "user": {
          "_links": {
            "self": { "href": "/user/1" }
          },
          "title": "passy"
        }
      },
      "title": "yours truly"
    }
  }
};

window.fixtures.simpleLink = {
  "_links": {
    "self": { "href": "/" },
    "orders": {
      "href": "https://example.com/orders/"
    }
  }
};
