# How to commit with a new version

Depending on the level of changes. For fixes use PATCH, for Minor changes or features use MINOR and for major changes and feature use MAJOR. These can be put in place of <VERSION> tag below.

```
  yarn version <VERSION>
  yarn format:write
  git add .
  git commit -m"<type>(<STATE>): <Message>"
  git push
```

This will increment the version, format the code, add it all to git, commit the changes and push them to the remote.
