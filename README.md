# TripTrekker

TripTrekker is a comprehensive booking application built with Typescript, NestJS, MySql, leveraging a variety of advanced features and integrations to deliver a robust, secure, and scalable service. The application supports multiple booking functionalities including flights, hotels, and activities, with dynamic relationships managed based on user roles and booking types.


## Table of Contents
- [Key Features and Functionalities](#key-features-and-functionalities)
-  [Diagrams](#diagrams)
-  [System Architecture](#system-architecture)
-  [Database Design](#database-design)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)

## Key Features and Functionalities

### 1. Flight Browsing and Booking
- Search Criteria: Users can search for flights based on destination, departure date, origin, and travel class.
- Real-time Data: The application retrieves real-time flight availability and prices from external APIs.
- Secure Booking: Users can select their desired flights and proceed to book them securely.

### 2. Hotel Browsing and Booking
- Search Criteria: Users can search for hotels based on location, check-in/check-out dates, room quantity, number of adults, cheapest offer, and amenities.
- Real-time Data: The application retrieves real-time hotel availability, rates, and amenities from external APIs.
- Secure Booking: Users can select their preferred hotel and proceed to book it securely.

### 3. Activity Package Browsing and Booking
- Search Criteria: Users can browse and search for various activity packages based on their location.
- Real-time Data: The application retrieves activity package details, itineraries, and prices from external APIs.
- Secure Booking: Users can select an activity package and proceed to book it securely.

### 4. 4. User Authentication and Authorization
- User Registration and Login: Users can create accounts by registering with their first name, last name, email, password, phone, and gender. Registered users can log in securely to access personalized features and manage bookings.
- Password Management: Features include forgot password and reset password functionalities for user convenience.

### 5. User Profile Management
- Profile Updates: Logged-in users can manage their profiles, update their data, delete their accounts, and change their passwords.

### 6. Secure Payment Integration
- Payment Gateway: TripTrekker integrates with the Stripe payment gateway to enable users to make secure online payments for their bookings.

### 7. Admin Dashboard
- User Management: Admins can view and manage user accounts, including updating user information, deactivating accounts, and deleting users.
- Analytics and Reporting: The dashboard provides insights and reports on user activities, bookings, payments, and more, helping admins to make informed decisions.



## Diagrams

![Screenshot (163)](https://github.com/user-attachments/assets/b88e3a28-e76d-45df-9054-e595c2b38720)


## System Architecture

![Screenshot (164)](https://github.com/user-attachments/assets/79664b04-490e-4801-9e04-b9b0c8ec521d)


 ## Database Design:
 
![TripTrekker eer](https://github.com/user-attachments/assets/d2083392-4b7a-445b-be3d-e062393502fa)


## Getting Started

### Prerequisites

Make sure you have the following installed on your system:


- [Node.js](https://nodejs.org/) (Node.js documentation)
- [Nest.js](https://https://nestjs.com) (Nest.js documentation)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- [Mysql](https://www.mysql.com/) (Make sure Mysql server is running)
- [Stripe account](https://stripe.com/) (stripe account)


### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Osama-Salih/TripTrekker.git
   
2. Navigate to the project directory:

     ```bash
   cd trip-trekker

4. Install dependencies:

    ```bash
   npm install

5. Set up environment variables: Create a .env file in the root directory and add your environment variables.


### Running the Application
1. To start the application in development mode:

 ```bash
npm run start:dev
```
2. To build the application:

 ```bash
 npm run build
 ```

To start the application in production mode:

  ```bash
npm run start:prod
```
### Contribution: 
Contributions are welcome! Please fork the repository and submit a pull request for any improvements.

The API will be accessible at https://trip-trekker-o0rf.onrender.com

#### TripTrekker - Your go-to platform for all your travel booking needs!


  
