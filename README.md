YUI Master Combo Handler
========================

Need to test YUI against master and need a combo handler?

Well, here's an example that pulls the JS &amp; CSS from Github and combo's them.

The requests are cached in memory for 5 minutes to make sure we don't explode Github's rate limit.

I've hosted this over at [http://jitsu.com](Nodejitsu) in case you wanted to give it a shot.

Here's an [http://dl.dropbox.com/u/5669457/yui-master-combo.html](example).

How it works
------------

It's basically a caching proxy to https://raw.github.com/yui/yui3/*

It only supports js &amp; css, no images.

It also supports `?filter=raw|debug|min` on the seed file to allow fo debugging.

When the seed file is served a small chunk of JS is appended to it to dynamically configure
the combo server for you:

```javascript
YUI.applyConfig({
     root: "",
     filter: "min",
     comboBase: "http://yui-master-combo.nodejitsu.com/combo?"
});
YUI.version = "yui-master-combo";
```

This tells the YUI seed to use `http://yui-master-combo.nodejitsu.com/combo?` as it's combo base
and set's the default filter to 'min' as well as modify the version stamp of the JS files.

All files that are passed through this 'proxy' will also have `@VERSION@` replaced with the same stamp.

Usage
-----

```html
<script src="http://yui-master-combo.nodejitsu.com/"></script>
<script src="http://yui-master-combo.nodejitsu.com/?filter=debug"></script>
<script src="http://yui-master-combo.nodejitsu.com/?filter=raw"></script>
```

```javascript

YUI().use('node', function(Y) {
    //Good To Go!
});
```

