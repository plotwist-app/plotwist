# Contributing 

> First of all, thanks for your interest in contributing to **Plotwist**! Here is a guide to help you contribute with this project. You can reach us on [Discord](https://discord.gg/NGvYPyTK5n). We can help you with the problems and you talk directly to the others developers and contributors. 

> It is important to mention that if you want to contribute you will need the **Supabase keys**, which are **only available to members of the discord community** that are part of the @Developers role (You'll need to ask to be a part of @Developers role for our moderators).

Summary:
- [Getting Started](#Getting-started)
- [Code Structure](#Structure)
- [How to run the project locally](#Running-the-project-locally)
- [Setting up environment variables](#Setting-up-the-environment-variables-for-Plotwist)
- [How to start a development server](#Starting-development-server)
- [Commit Convention](#Commit-Convention)
- [Requesting and Reporting](#Requests-for-new-feature/bug-fix)

## About this repository:

This repository is a `monorepo`. Which means that the source-code is stored on a single versioned repository. 

- We use pnpm and workspaces for development.
- We use Turborepo as our build system. It is a modern tool for managing `monorepos`, focused on optimizing the development and build processes of projects in monorepos. Read the documentation here: [Turborepo Documentation](https://turbo.build/repo/docs)


# Getting started

## Structure
```
apps
└── web
    ├── public
        ├── dictionaries
            ├── de-DE.json
            ├── en-US.json
            ├── es-ES.json
            ├── fr-FR.json
            ├── it-IT.json
            ├── ja-JP.json
            ├── pt-BR.json
    ├── src
        ├── components
        ├── app
            ├── [lang] 
packages
└── emails [...]
└── eslint-config
└── tmdb
└── supabase [...]
└── typescript-config
```

### 1. Clone the project
    git clone https://github.com/plotwist-app/plotwist.git
    
### 2. Install dependencies
    pnpm install

## Running the project locally
To run the project locally, you'll need to configure several environment variables. Here are the variables you need to set up:

- `NEXT_PUBLIC_TMDB_API_KEY=` (Obligatory)
- `NEXT_PUBLIC_SUPABASE_URL=`  (Obligatory)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=`  (Obligatory)
- `NEXT_PUBLIC_MEASUREMENT_ID=` (Optional)
- `RESEND_KEY=`  (Optional)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=` (Optional)
- `STRIPE_SECRET_KEY=`  (Optional)
- `STRIPE_WEBHOOK_SECRET=`  (Optional)

## Setting up the environment variables for Plotwist

### 1. `NEXT_PUBLIC_TMDB_API_KEY`

   > ⚠️ This is a **obligatory** environment variable you need to **provide on your own**.

   **Purpose:** This key is used to access the TMDB (The Movie Database) API.

   **Instructions:**
   - Visit [TMDB API](https://www.themoviedb.org/documentation/api) and sign up for an account if you don't have one.
     - Once logged in, navigate to your account settings and select "API" to create a new API key.
     - Copy the generated API key and set it in your `.env` file:
       ```
       NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
       ```

### 2. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   > ⚠️ This is a **obligatory** variable you need to **provide on your own**.

   > ⚠️ While we are working on improving the contribution process, check our [Discord group](https://discord.gg/NGvYPyTK5n) and ask to be a contributor, then use our development environment in Supabase provided by the developers in the group.

   **Purpose:** These keys are used to connect to your Supabase project.

   **Instructions:**
   - Sign up for an account at [Supabase](https://supabase.io/) if you don't have one.
     - Create a new project and navigate to the project settings.
     - Under the "API" section, you will find your `URL` and `Anon Key`.
       ```
       NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
       NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
       ```
### 3. `NEXT_PUBLIC_MEASUREMENT_ID`

   **Purpose:** This key is used for Google Analytics to track and analyze traffic.

   **Instructions:**
   - Go to [Google Analytics](https://analytics.google.com/) and sign up for an account if needed.
     - Create a new property and follow the setup instructions to get your Measurement ID.
     - Copy the Measurement ID and set it in your `.env` file:
       ```
       NEXT_PUBLIC_MEASUREMENT_ID=your_measurement_id
       ```

### 4. `RESEND_KEY`

   **Purpose:** This key is used for sending emails through a service like Resend.

   **Instructions:**
   - Sign up for an account at [Resend](https://resend.com/) or any similar email sending service.
     - Generate an API key from the dashboard.
     - Copy the API key and set it in your `.env` file:
       ```
       RESEND_KEY=your_resend_key
       ```

### 5. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`

   **Purpose:** These keys are used to integrate Stripe for payment processing.

   **Instructions:**
   - Sign up for an account at [Stripe](https://stripe.com/)
     - Navigate to the Developers section and obtain your `Publishable Key` and `Secret Key`.
     - To get the `Webhook Secret`, you need to set up a webhook endpoint:
        - In the Stripe dashboard, go to "Developers" -> "Webhooks" and create a new webhook.
        - Set the webhook URL to your application's endpoint and select the events you want to listen to.
        - Stripe will provide you with a Webhook Secret after the setup.
        - Copy these keys and set them in your `.env` file:
        ```
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
        STRIPE_SECRET_KEY=your_stripe_secret_key
        STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
        ```

## Starting development server
> ⚠️ Make sure your tools match those versions exactly if your facing issues running after the .env setup:
- npm: 10.5.2
- node: v20.13.1
- pnpm: 9.1.1

After setting up the environment variables, you can run the project:
#### 1. Start the development server:
    pnpm run dev
#### 2. Register a User:
    When the app is running, use the interface to register a new user.
#### 3. Interact with the App:
    Once registered, you can interact with the authenticated processes within the app.


# Commit Convention
Here we use a convention to make the commits more productive. Before you create a Pull Request, please check whether your commits comply with the commit conventions used in this repository. Learn more here: https://www.conventionalcommits.org/en/v1.0.0/

When you create a commit we kindly ask you to follow the convention category (scope or module) message in your commit message while using one of the following categories:

- `feat / feature`: all changes that introduce completely new code or new features

- `fix`: changes that fix a bug

- `refactor`: any code related change that is not a fix nor a feature

- `docs`: changing existing or creating new documentation

- `build`: all changes regarding the build of the software, changes to dependencies or the addition of new dependencies

- `test`: all changes regarding tests (adding new tests or changing existing ones)

- `chore`: all changes to the repository that do not fit into any of the above categories

# Requests for new feature/bug fix
If you have a request for a new feature, please open a discussion on GitHub. We'll be happy to help you out!


