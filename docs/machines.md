## Machines
Machines are components that control the flow of the USSD (Unstructured Supplementary Service Data) session, guiding the navigation from page to page based on user input and auxiliary data stored in context objects. They rely on two core interfaces, `MachineInterface` and `MachineServiceInterface`, which define the structure and functionality of the machines and their associated services.

### MachineInterface
```typescript
export interface MachineInterface {
  stateMachine: StateMachine<any, any, MachineEvent>,
  translate: (context: any, state: string, translator: any) => Promise<LocalizedString>,
}
```
The MachineInterface represents a machine in the application. It has two properties:

- `stateMachine`: This property represents the finite state machine implemented by the machine. The state machine is built using [xstate](https://xstate.js.org/docs/#finite-state-machines). It uses a generic type `StateMachine<any, any, MachineEvent>`, where the first two type parameters are placeholders for the `state` and `event` types used by the state machine, and MachineEvent represents the type of events that can be triggered.

- `translate`: This property is a function that translates the machine's state into a localized string. It takes three parameters:
  - `context (any)`: The machine's latest context after a successful transition, used for translation.
  - `state (string)`: The current state of the machine.
  - `translator (any)`: The translation service or object. The function returns a promise that resolves to a LocalizedString, representing the translated string.

### MachineServiceInterface
```typescript
export interface MachineServiceInterface {
  stop: () => void,
  transition: (event: MachineEvent) => void,
}
```
The MachineServiceInterface is a singleton that manages the creation and retrieval of machines. It provides two core methods:
- `stop`: This method is used to stop the machine.
- `transition`: This method triggers a transition in the machine by passing an event of type MachineEvent. It does not return a value.

## Functionality
Machines operate based on user input and context objects. This section explores functionality and implementation of these components.

### User Input
User input serves as the primary driver for state transitions in the machine. It is represented by the `MachineEvent` type, which is an enum with the following values:

```typescript
export type MachineEvent =
  | { type: "BACK" }
  | { type: "RETRY", feedback: keyof NamespaceFeedbackTranslation}
  | { type: "TRANSIT", input: string }
```
- `BACK`: This event is triggered when the user enters a value that corresponds to the "back" action in the USSD menus. It transitions the machine to the previous state.
- `RETRY`: This event is triggered when the user enters an invalid value that allows them to retry their entry. It also provides feedback mapped to a set of states. A feedbackAPI can use this feedback to return localized strings describing the nature of the error.
- `TRANSIT`: This event is triggered when the user enters a valid value that leads to a transition to a new state. It takes a string input parameter representing the user's input.

### Context Objects
Context objects store auxiliary data used by the machine for various operations, such as looking up data from cache and determining states and transitions. The MachineContext type represents the consolidated context objects of all machines. It is defined as follows:

```typescript
export type MachineContext =
  | AuthContext
  | BaseContext
  | BalancesContext
  | LanguagesContext
  | NotifierContext
  | PinManagementContext
  | ProfileContext
  | RegistrationContext
  | SocialRecoveryContext
  | StatementContext
  | TransferContext
  | UserContext
  | VouchersContext
  ```
All context objects are defined as interfaces that extend the `BaseContext` interface:

```typescript
export interface BaseContext {
  connections: Connections,
  data: Record<string, any>,
  errorMessages: string[],
  ussd: Ussd,
}
```
The BaseContext interface has four properties:

- `connections`: Represents the connections object, including database, GraphQL client, Ethereum provider, and Redis client connections.
- `data`: Stores data from the user's session.
- `errorMessages`: Contains an array of strings representing error messages from the finite state machine.
- `ussd`: Represents the USSD object received from the USSD service provider.
The connections property has the following structure:

```typescript
export type Connections = {
  db: PostgresDb,
  graphql: GraphQLClient,
  provider: Provider,
  redis: {
    ephemeral: RedisClient,
    persistent: RedisClient
  }
}
```
- `db`: Represents the database connection.
- `graphql`: Represents the GraphQL client connection.
- `provider`: Represents the Ethereum provider connection.
- `redis`: Represents the Redis client connections, including both ephemeral and persistent stores.

The base context is further extended into specific interfaces representing the context objects of different machines, such as `UserContext` and `NotifierContext`. These interfaces provide additional properties specific to each machine's context.

### Machine Lifecycle
The machine lifecycle is managed by the `MachineService` class, which implements the `MachineServiceInterface`. It has the following properties:

- `service`: An instance of the xstate [interpreter](https://xstate.js.org/docs/guides/interpretation.html#interpreter), which is used to create and manage the machine.
- `transition`: A function that triggers a transition in the machine by passing an event of type `MachineEvent`
- `response`: A function that returns the machine's response to the USSD service provider. It takes a `MachineContext` object, machineId and state as parameters and returns a `Promise<LocalizedString>`, which resolves to a string representing the USSD response.
- `stop`: A function that stops the machine.