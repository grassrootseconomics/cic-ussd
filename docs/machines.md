## Machines
Machines are components that control the flow of the USSD (Unstructured Supplementary Service Data) session, guiding the navigation from page to page based on user input and auxiliary data stored in context objects. They rely on two core interfaces, `MachineInterface` and `MachineServiceInterface`, which define the structure and functionality of the machines and their associated services.

### MachineInterface

The MachineInterface represents a machine in the application. It has two properties:

- `stateMachine`: This property represents the finite state machine implemented by the machine. The state machine is built using [xstate](https://xstate.js.org/docs/#finite-state-machines).

- `translate`: This property is a function that translates the machine's state into a localized string. It takes three parameters:
  - `context (any)`: The machine's initial context or its latest context after a successful transition.
  - `state (string)`: The current state of the machine.
  - `translator (any)`: The translation service or object. The function returns a promise that resolves to a LocalizedString, representing the translated string.

### MachineServiceInterface

The MachineServiceInterface is a singleton that manages the creation and retrieval of machines. It provides two core methods:
- `stop`: This method is used to stop the machine.
- `transition`: This method triggers a transition in the machine by passing an event of type MachineEvent. It does not return a value.

## Functionality
Machines operate based on user input and context objects. This section explores functionality and implementation of these components.

### User Input
User input serves as the primary driver for state transitions in the machine. It is represented by the `MachineEvent` type, which is an enum with the following values:

- `BACK`: This event is triggered when the user enters a value that corresponds to the "back" action in the USSD menus. It transitions the machine to the previous state.
- `RETRY`: This event is triggered when the user enters an invalid value that allows them to retry their entry. It also provides feedback mapped to a set of states. A feedbackAPI can use this feedback to return localized strings describing the nature of the error.
- `TRANSIT`: This event is triggered when the user enters a valid value that leads to a transition to a new state. It takes a string input parameter representing the user's input.

### Context Objects
Context objects store auxiliary data used by the machine for various operations, such as looking up data from cache and determining states and transitions. The MachineContext type represents the consolidated context objects of all machines.
All context objects are defined as interfaces that extend the `BaseContext` interface:
The BaseContext interface has four properties:

- `connections`: Represents the connections object, including database, GraphQL client, Ethereum provider, and Redis client connections.
- `data`: Stores data from the user's session.
- `errorMessages`: Contains an array of strings representing error messages from the finite state machine.
- `ussd`: Represents the USSD object received from the USSD service provider.

The base context is further extended into specific interfaces representing the context objects of different machines, such as `UserContext` and `NotifierContext`. These interfaces provide additional properties specific to each machine's context.

### Machine Lifecycle
The machine lifecycle is managed by the `MachineService` class, which implements the `MachineServiceInterface`. It has the following properties:

- `service`: An instance of the xstate [interpreter](https://xstate.js.org/docs/guides/interpretation.html#interpreter), which is used to start and manage the machine.
- `transition`: A function that triggers a transition in the machine by passing an event of type `MachineEvent`
- `response`: A function that returns the machine's response to the USSD service provider. It takes a `MachineContext` object, machineId and state as parameters and returns a `Promise<LocalizedString>`, which resolves to a string representing the USSD response.
- `stop`: A function that stops the machine.