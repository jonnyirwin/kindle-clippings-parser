# Convert Kindle 'My Clippings.txt' into Markdown files

Used to incorporate book highlights into a note taking application such as [Obsidian](https://obsidian.md).

## Usage

Drop the 'My Clippings.txt' file from your Kindle in the root directory of this repository. Run `node app.mjs`. Markdown files will be created in the *books* sub-directory.

## Limitations

This script was put together quickly just to get something that worked. It currently only pulls in highlights and does not handle notes.