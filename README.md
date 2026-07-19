# arjunkul.github.io

A small personal blog built with [Hugo](https://gohugo.io/) and the [Hugo Bear Blog](https://github.com/janraasch/hugo-bearblog) theme.

Clone the theme submodule along with the repository:

```sh
git clone --recurse-submodules https://github.com/arjunkul/arjunkul.github.io.git
```

## Run locally

Install Hugo, then start the development server:

```sh
hugo server -D
```

Open <http://localhost:1313>.

## Add a post

```sh
hugo new content posts/my-post.md
```

Edit the generated Markdown file, add `type: blog` to its front matter, and set `draft: false` when it is ready.

## Publish

Push to `master`. The GitHub Actions workflow builds the site and deploys it to GitHub Pages. In the repository settings, set **Pages → Source** to **GitHub Actions** the first time.
