# cic-ussd

![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/grassrootseconomics/cic-ussd/.github%2Fworkflows%2Frelease.yaml)
![GitHub tag (with filter)](https://img.shields.io/github/v/tag/grassrootseconomics/cic-ussd)



A [Fastify](https://www.fastify.io/)-based, [USSD](https://en.wikipedia.org/wiki/Unstructured_Supplementary_Service_Data) client implementation, that interfaces with the community inclusion currencies [custodial system](https://cic-stack.grassecon.org/custodial/cic-custodial). It is built using Node.js (>=18). The app is designed to provide a simple and efficient way to create and manage USSD menus and interactions.

## Pre-requisites

- Node.js >= 18
- NPM (*Tested on v9.3.1*)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/grassrootseconomics/cic-ussd
```

2. Change into the project directory:

```bash
cd cic-ussd
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory of the project and add your environment variables:

```bash
cp .env.example .env
```

## Running the app

To start the application in development mode, run:

```bash
npm run dev
```

To start the application in production mode, first build the application:

```bash
npm run build
```

Then start the application:

```bash
npm start
```

The application will be available at `http://localhost:9000`.


## Usage

The app exposes an API for handling USSD requests. It currently supports the [AfricasTalking USSD API](https://developers.africastalking.com/docs/ussd/overview). To use the API, send a POST request to the `v1/ussd/${AT_USSD_ENDPOINT_SECRET}` endpoint with the appropriate USSD payload. We recommend using the [Dialoguss](https://github.com/nndi-oss/dialoguss) library for a more interactive and streamlined USSD experience.

Example request:

```json
{
  "sessionId": "1234",
  "serviceCode": "*123#",
  "phoneNumber": "+254712345678",
  "text": "1*2*3"
}
```

The app will process the request and return a response in the format expected by USSD gateways. Example response:

```text
CON Welcome to Sarafu Network!
1. English
2. Kiswahili

00.Exit
11. Next
```

## Contributing
If you would like to contribute to this project, please read our [contributing guide](CONTRIBUTING.md).


## License
This project is licensed under the GNU Affero General Public License v3.0. See the [LICENSE](LICENSE) file for details.
