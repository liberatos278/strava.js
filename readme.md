# strava.js
<a href="https://www.npmjs.com/package/@liberatos/strava.js" alt="Version">
    <img src="https://img.shields.io/npm/v/@liberatos/strava.js" />
</a>
<a href="https://www.npmjs.com/package/@liberatos/strava.js" alt="Version">
    <img src="https://img.shields.io/npm/l/@liberatos/strava.js" />
</a>
<a href="https://www.npmjs.com/package/@liberatos/strava.js" alt="Version">
    <img src="https://img.shields.io/npm/dm/@liberatos/strava.js" />
</a>

Simple and intuitive client for communication with *strava.cz* API.

## Installation

*You need Node and NPM (Node Package Manager)*

`npm install @liberatos/strava.js`


## How to start

#### Create new *strava.js* client

```javascript
  const client = new Client(username, password, code, options)
  
  client.login((sessionId) => {
    console.log(`Logged in with sessionId: ${sessionId}`)
  })
```

| Parameter | Type     | Required | Description                |
| :-------- | :------- | :-------: | :------------------------- |
| `username` | `string` | Yes | Strava.cz credentials (username) |
| `password` | `string` | Yes  | Strava.cz credentials (password) |
| `code` | `number` | Yes  | Code of canteen |
| `options` | `ClientOptions` | No | Custom client settings |

#### *ClientOptions*
| Parameter | Type     | Default | Description                |
| :-------- | :------- | :-------: | :------------------------- |
| `refreshSession` | `boolean` | `false` | Automatically renews the session if it expires |
| `autoSave` | `boolean` | `false` | Saves orders immediately after changing |

## Features

The *strava.js* client provides several 
methods for retrieving or modifying data. Most of them are asynchronous.

- `login(callback)`
- `logout()`
- `getOverpayment()`
- `getOrders()`
- `getDispensings()`
- `getPayments()`
- `getMessages()`
- `changeOrder(orderId, mealId, state)`
- `changeOrders(changes)`
- `saveOrders(orders)`

### `async` login(callback): Promise<string>
Calling the method is necessary before using other client functions that require user authorization. If the login is successful, it returns the *sessionId*. Similarly, the callback 
function will be called with the parameter of the retrieved *sessionId*, if specified.

### `async` logout(): Promise<void>
This method invalidates the sessionId, thus logging the user out. Returns void.

**Authorization is required for use**

### `async` getOverpayment(): Promise<FinancialAmount>
Returns the current overpayment on the user's account.

**Authorization is required for use**

### `async` getOrders(): Promise<Order[]>
Returns all available user's orders and meals.

**Authorization is required for use**

### `async` getDispensings(): Promise<Dispensing[]>
Returns available order dispensing history.

**Authorization is required for use**

### `async` getPayments(): Promise<Payment[]>
Returns the payment history of the user's account (top-ups).

**Authorization is required for use**

### `async` getMessages(): Promise<Message[]>
Returns messages that have been sent to the user. Currently only general 
information about the message can be retrieved, content is not supported for now.

**Authorization is required for use**

### `async` changeOrder(orderId, mealId, state): Promise<Order[]>
Returns a modified array of orders as requested. 
The method has validation implemented, so you can't have two types of meals logged per order. 
If you try to log two meals, the originally logged meal will be checked out. 
If you can no longer change the status of the order, you will receive an error. Only one order can be edited at a time using this method.

If `autoSave` is enabled, the change will be automatically saved on the server - otherwise you have to save it manually.

```javascript
  const modified = await client.changeOrder(1672500000, 1, true)
```

**Authorization is required for use**

### `async` changeOrders(changes): Promise<Order[]>
This method is identical to the previous one, but you can change multiple orders at once.

```javascript
  const changes: ChangeMealOptions[] = [
    { orderId: 1672500000, mealId: 1, state: false },
    { orderId: 1662430000, mealId: 2, state: false },
    { orderId: 1663800000, mealId: 1, state: true }
  ]

  const modified = await client.changeOrders(changes)
```

**Authorization is required for use**

### `async` saveOrders(orders): Promise<void>
The method saves all orders that are passed as a parameter. 
It is necessary to save all available orders as well as those that have not been changed.

I recommend using the `autoSave` function, which means you won't have to use this feature at all.

```javascript
  const modified = await client.changeOrder(1672500000, 1, true)
  await client.saveChanges(modified)
```

**Authorization is required for use**

## Typing
An overview of the interfaces used by the package.

#### **Order**
| Parameter | Type      | Description                |
| :-------- | :-------  | :------------------------- |
| `id` | `number` | Created from unix timestamp |
| `date` | `Date` | Date of order |
| `meals` | `Array<Meal>` | Meals available in order |

#### **Meal**
| Parameter | Type      | Description                |
| :-------- | :-------  | :------------------------- |
| `id` | `number` |  |
| `name` | `string` | |
| `description` | `string` |  |
| `selected` | `boolean` | Is meal selected within the order |
| `canChange` | `boolean` | If the selected state can be changed |
| `allergens` | `Array<string> \| null` |  |
| `details` | `MealDetails` | Detail infomations |

#### **MealDetails**
| Parameter | Type      | Description                |
| :-------- | :-------  | :------------------------- |
| `price` | `FinancialAmount \| null` |  |
| `endOfCheckIn` | `Date \| null` | |
| `endOfCheckOut` | `Date \| null` |  |

#### **FinancialAmount**
| Parameter | Type      | Description                |
| :-------- | :-------  | :------------------------- |
| `amount` | `number` |  |
| `currency` | `string` |  |

#### **Dispensing**
| Parameter | Type      | Description                |
| :-------- | :-------  | :------------------------- |
| `description` | `string` |  |
| `date` | `Date` |  |
| `pickupTime` | `number \| null` | Time when the meal was picked up |
| `picked` | `boolean` |  |
| `mealVoucher` | `boolean` | If the voucher was used to pick up the meal |

#### **Payment**
| Parameter | Type      | Description                |
| :-------- | :-------  | :------------------------- |
| `description` | `string` |  |
| `date` | `Date` |  |
| `details` | `FinancialAmount` |  |

#### **Message**
| Parameter | Type      | Description                |
| :-------- | :-------  | :------------------------- |
| `subject` | `string` |  |
| `recipient` | `string` | Most often email |
| `date` | `Date` |  |

#### **ChangeMealOptions**
| Parameter | Type      | Description                |
| :-------- | :-------  | :------------------------- |
| `orderId` | `number` |  |
| `mealId` | `number` |  |
| `state` | `boolean` |  |




## Authors

- [@liberatos278](https://www.github.com/liberatos278)

