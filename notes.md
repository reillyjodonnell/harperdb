```
fetch('http://localhost:9926/User', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: 1, name: 'harper' })
})
Promise {<pending>}
VM31:1


 PUT http://localhost:9926/User 500 (Internal Server Error)

2025-03-07T02:53:04.151Z [http/2] [error]: Error: Invalid primary key of null
    at Yi (/Users/reilly/.bun/install/global/node_modules/harperdb/server/threads/threadServer.js:40:149775)
    at User._writeUpdate (/Users/reilly/.bun/install/global/node_modules/harperdb/server/threads/threadServer.js:40:126437)
    at User.update (/Users/reilly/.bun/install/global/node_modules/harperdb/server/threads/threadServer.js:40:123962)
    at User.put (/Users/reilly/.bun/install/global/node_modules/harperdb/server/threads/threadServer.js:40:126343)
    at Lr.put.Jn.hasContent (/Users/reilly/.bun/install/global/node_modules/harperdb/server/threads/threadServer.js:40:107578)
    at /Users/reilly/.bun/install/global/node_modules/harperdb/server/threads/threadServer.js:40:105000
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at http (/Users/reilly/.bun/install/global/node_modules/harperdb/server/threads/threadServer.js:40:33708)
    at authentication (/Users/reilly/.bun/install/global/node_modules/harperdb/server/threads/threadServer.js:18:6622)
    at Server.<anonymous> (/Users/reilly/.bun/install/global/node_modules/harperdb/server/threads/threadServer.js:132:5158)
```

```
reilly@mac harperdb-app % curl --location --request POST 'http://localhost:9926/User' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "reilly",
  "email": "r@test.com"
}'
"Error: The User does not have a post method implemented to handle HTTP method POST"%
```

### Thoughts

We have an insane DX win if we integrate TS to get autocomplete for tables

`npx harperdb studio` AND BOOM you have localhost:3000/studio up and running to interact with db

http://localhost:9925/ has the studio - holy cow that was difficult to find

In the studio I'd love to be able to change values in the input/cell instead of it doing a json representation that doesn't show the attributes
