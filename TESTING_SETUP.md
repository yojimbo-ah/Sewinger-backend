## Backend Testing Setup

This document explains the testing infrastructure that has been configured for the Sewinger backend application.

### What Was Changed

#### 1. **app.js - Refactored**
- Previously: Created the Express app, initialized Socket.io, connected to MongoDB, and started the server all in one file.
- Now: Exports a `createApp()` function that returns a configured Express app instance without database connection or server startup logic.
- This separation allows the app to be imported and tested without side effects.

**Key Change:**
```javascript
export const createApp = () => {
  const app = express();
  // Setup middleware and routes
  return app;
};

export default createApp(); // Default export for convenience
```

#### 2. **index.js - New Entry Point**
- Handles database connection and server startup
- Initializes Socket.io
- Replaces the previous responsibility of app.js
- Use this to start the application in production/development

**To start the server:**
```bash
npm start
# or
npm run dev  # with nodemon for development
```

#### 3. **jest.config.js - New Test Configuration**
- Configures Jest for testing Node.js applications
- Uses in-memory MongoDB (no external database needed for tests)
- Sets up automatic cleanup with `setup.js`
- Configured to find test files: `**/*.test.js` or `**/*.spec.js`

#### 4. **tests/setup.js - Automatic Database Setup/Teardown**
Provides:
- `connectDB()` - Connects to in-memory MongoDB before tests
- `closeDB()` - Closes the connection and stops the server after tests
- `clearDB()` - Clears all collections between test cases
- Automatically runs with `beforeAll`, `afterEach`, and `afterAll` hooks

#### 5. **tests/helpers.js - Test Utilities**
Provides:
- `api(app)` - Wrapper around Supertest for making HTTP requests
- `testHelpers.createTestUser()` - Generate test user objects
- `testHelpers.createTestProduct()` - Generate test product objects
- `testHelpers.generateValidToken()` - Generate test JWT tokens

#### 6. **tests/api.test.js - Sample Test File**
Shows how to:
- Import and use the app
- Make API requests with Supertest
- Test endpoints
- **Note:** This is a sample; modify or replace based on your actual routes

#### 7. **package.json - Updated Scripts**
```json
{
  "scripts": {
    "start": "nodemon index.js",      // Start dev server
    "dev": "nodemon index.js",        // Alias for start
    "test": "jest",                   // Run tests once
    "test:watch": "jest --watch",     // Run tests in watch mode
    "test:coverage": "jest --coverage" // Run tests with coverage report
  }
}
```

### Dependencies Installed

```json
{
  "devDependencies": {
    "jest": "^29.x",
    "supertest": "^6.x",
    "mongodb-memory-server": "^9.x",
    "@types/jest": "^29.x"
  }
}
```

### How to Write Tests

#### Example: Testing an API Endpoint

```javascript
import { createApp } from '../app.js';
import { api } from './helpers.js';

describe('Product Routes', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('POST /product', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
      };

      const response = await api(app)
        .post('/product')
        .send(newProduct)
        .expect(201);

      expect(response.body.product.name).toBe('Test Product');
      expect(response.body.product.price).toBe(99.99);
    });
  });

  describe('GET /product/:id', () => {
    it('should fetch a product by ID', async () => {
      const response = await api(app)
        .get('/product/12345')
        .expect(200);

      expect(response.body.product).toBeDefined();
    });
  });
});
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Important Notes

1. **In-Memory Database**: All tests use `mongodb-memory-server`, which creates a temporary MongoDB instance. This means:
   - Tests are isolated and don't affect your production database
   - Tests run faster than against a real database
   - Each test file gets a fresh database

2. **Database Reset**: After each test, the database is automatically cleared via `clearDB()` in setup.js

3. **Socket.io**: The sample test doesn't use Socket.io. If you need to test real-time features, you may need additional configuration.

4. **Authentication**: For tests requiring authentication:
   - Mock JWT tokens or use test helper functions
   - Consider using `jest.mock()` for authentication middleware

5. **Environment Variables**: 
   - Tests should not require `.env` variables
   - Use test defaults or mock them
   - Avoid connecting to production databases during testing

### Next Steps

1. **Write tests for existing routes**: Create test files in `tests/` directory following the pattern in `api.test.js`

2. **Test database models**: Create tests in `tests/models/` to verify schema validation and hooks

3. **Test middleware**: Create tests in `tests/middleware/` for authentication and other middleware

4. **Setup CI/CD**: Configure your deployment pipeline to run `npm test` before deployment

### Troubleshooting

**Issue: "Cannot find module" errors**
- Ensure you're using ES modules syntax (`import`/`export`)
- Jest is configured for ES modules with `transform: {}`

**Issue: Database connection errors during tests**
- The setup.js file handles this automatically
- Ensure `setupFilesAfterEnv` is correctly configured in jest.config.js

**Issue: Tests timeout**
- Increase Jest timeout: `jest.setTimeout(10000)`
- Check that async operations complete

**Issue: Module not resetting between tests**
- The `resetMocks: true` in jest.config.js handles this
- For additional cleanup, use `clearDB()` explicitly
