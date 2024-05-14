# Contributing 

Thanks for your interest in contributing to **Plotwist**.

# About this repository
This repository is a `monorepo`.

- We use pnpm and workspaces for development.
- We use Turborepo as our build system.

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

# Development


# Commit Convention
Before you create a Pull Request, please check whether your commits comply with the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention category(scope or module): message in your commit message while using one of the following categories:

- `feat / feature`: all changes that introduce completely new code or new features

- `fix`: changes that fix a bug

- `refactor`: any code related change that is not a fix nor a feature

- `docs`: changing existing or creating new documentation

- `build`: all changes regarding the build of the software, changes to dependencies or the addition of new dependencies

- `test`: all changes regarding tests (adding new tests or changing existing ones)

- `chore`: all changes to the repository that do not fit into any of the above categories

# Requests for new feature/bug fix
If you have a request for a new feature, please open a discussion on GitHub. We'll be happy to help you out!


