# Shopping Cart Application

This is a full-stack e-commerce application with a Next.js frontend and a Node.js/Express backend. It includes features like product display, cart management, and Stripe checkout.

## Project Demo

[Full-Stack E-commerce Application Walkthrough](https://www.loom.com/share/81e4fdc98c724680b0e8136a4bb6176f?sid=24fc635f-ac22-40a4-a726-615c0ff6af22)

This project was built as part of the ASE Challenge by Verto. It demonstrates a full-stack shopping cart application with a Next.js frontend and a Node.js/Express backend. The application is deployed on Vercel.

[LinkedIn Post](https://www.linkedin.com/posts/darshhajgude_full-stack-e-commerce-application-walkthrough-activity-7382530795229319168-ZTXK?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD4RXT4Biaw8aHgO6CSevi7g3D5sK1E8npE)

## Local Setup and Running

### Backend

1.  Navigate to the `backend` directory.
2.  Install dependencies: `npm install`.
3.  Create a `.env` file with the following variables:
    -   `MONGO_URI`: Your MongoDB connection string.
    -   `STRIPE_SECRET_KEY`: Your Stripe secret key.
    -   `JWT_SECRET`: A secret for signing JWTs.
4.  Run the database seeder: `node seed.js`.
5.  Start the server: `npm run dev`.

### Frontend

1.  Navigate to the `frontend` directory.
2.  Install dependencies: `npm install`.
3.  Create a `.env` file with the following variable:
    -   `NEXT_PUBLIC_API_URL=http://localhost:5000`
4.  Start the server: `npm run dev`.

## Running Test Cases

This project includes a script for manually testing the checkout flow. To run it, execute the following command from the root directory:

```
node test-checkout.js
```

## Assumptions and Design Choices

-   **Database:** The application uses MongoDB as its database.
-   **Payments:** Stripe is used for payment processing.
-   **Authentication:** Authentication is handled using JSON Web Tokens (JWT).
-   **Frontend:** The frontend is built with Next.js and styled with Tailwind CSS.
-   **Backend:** The backend is a Node.js application built with the Express.js framework.
-   **Database Seeding:** The database is seeded with sample data for products.
-   **Environment:** The application is designed to be run locally in a development environment.
