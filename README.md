# Note Thumbnails
This plugin is designed to generate thumbnails for notes in the [bases](https://obsidian.md/help/bases) [card view](https://obsidian.md/help/bases/views/cards).
## Features
The plugin is capable of rendering thumbnails in two different ways:
- A faster, less "as-seen" render using CodeMirror's `MarkdownRenderer`.
- A slower, more "as-seen" render by physically rendering the note and capturing its contents.
## Installtion & Usage
### Installation
1. This plugin is not yet publicly listed (coming soon!). For now, you can use [BRAT](https://github.com/TfTHacker/obsidian42-brat) and ensure it is installed and enabled.
2. Enter the options/settings for BRAT and add a new beta plugin.
3. Use `infinity6542/note-thumbnails` as the repository.
4. Select "Latest version".
5. Ensure "Enable after installing the plugin" is ticked and click on "Add plugin".
6. You're done!
### Trying It Out
> [!TIP]
> Struggling? Need some help? Check out the labelled screenshots below that explain the more complicated parts of usage!

1. Create some files! Any standard Markdown (e.g. highlights, bold, italics, etc.) syntax is currently supported. Images, canvases, etc. have not yet been tested.
2. Create a base file. You can do this by right-clicking on the file explorer (not on a file please) and choosing "Create base".
3. Let's create some filters! Click "Filters" in the top left of the active leaf and click the "All views" dropdown.
4. Ensure that the filter is set to "All the following are true" and create one new filter so that there are two.
5. Click the code icon to the left of both filters, then copy paste these into both (one per filter): `!file.name.contains(".jpg")!file.name.contains(".jpg")` and `!file.name.contains(".base")`. Your filters are complete!
6. Let's generate the thumbnails now. Open the command palette (defualt keybind is `ctrl+p`) and search for "Note Thumbnails: Generate thumbnails". Either click it or press enter on your keyboard when it's highlighted.
7. Now we need to view your thumbnails. Your default view should be a table. Let's change that! Go to the top left and click the view switcher (it should say "Table" currently).
8. Click the right arrow on the "Table" view.
9. Click the "Layout" dropdown and select "Cards".
10. Click "Image property" and choose "thumbnail". Adjust the parameters as you please!
11. You're done! If the thumbnails don't properly fit the card, simply regenerate the thumbnails (see step 6).

![[3-5.jpg]]

![[6.jpg]]

![[7-8.jpg]]

![[9-10.jpg]]

## Bugs, Issues and Feature Requests
> [!IMPORTANT]
> The GitHub repository is a read-only mirror. Please make any bug reports or feature requests in the [GitLab repository](https://gitlab.com/Infinity6542/note-thumbnails).
## Contributing
> [!IMPORTANT]
> The GitHub repository is a read-only mirror. Please fork from and submit pull requests to the [GitLab repository](https://gitlab.com/Infinity6542/note-thumbnails).

Contributions are welcome! Simply fork the repo, make your changes and submit a pull request to [this repository](https://gitlab.com/Infinity6542/note-thumbnails)
