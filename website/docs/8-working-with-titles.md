# Working with titles

Titles can be represented as objects created using the class constructor on `mwn`, as: (`bot` is the mwn object)

```js
let title = new bot.title('Wikipedia:Articles for deletion');

// The constructor throws if given an illegal page name. To avoid this the static method can be used instead
title = bot.title.newFromText('Wikipedia:Articles for deletion'); // same effect

// Can also construct titles from namespace number and the page name
title = new bot.title('Aritcles for deletion', 4);

title.getMainText(); // 'Articles for deletion'
title.getNamespaceId(); // 4

title = bot.title.newFromText('catEgorY:living people'); // titles will be normalised!
title.toText(); // 'Category:Living people'
```

The API of this class is based on that of [mw.Title](https://doc.wikimedia.org/mediawiki-core/master/js/#!/api/mw.Title) in the on-site JS interface. See [full list of methods](https://mwn.toolforge.org/docs/api/interfaces/mwntitle.html).
