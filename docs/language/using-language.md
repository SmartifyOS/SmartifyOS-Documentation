---
sidebar_position: 1
---

# Using the Language

`SmartifyOsLanguage`, from `package:smartify_os_core/language.dart`, says which language the car is
in, the one every text on the screen is shown in. SmartifyOS has its own texts in English and
German. Anything it has no texts for is shown in English.

You need this page for two things: keeping texts of your own in the same language as the rest of
the car, and anything that listens or speaks (a voice assistant, a navigation voice), which has to
know which language to use.

## Reading the language

```dart
SmartifyOsLanguage.languageCode;       // 'en', 'de', ...
SmartifyOsLanguage.supportedLanguages; // every language SmartifyOS has texts in
```

The language is a two letter code, the same kind you'd find in a file name like `de.i18n.json`.

## Following it when it changes

The language can change while the car is running. To keep up, listen to `languageChanges`, which
hands you the new code every time:

```dart
SmartifyOsLanguage.languageChanges.listen((code) {
  myVoice.setLanguage(code);
});
```

`languageChanges` only says when the language changes, not what it is at the start, so read
`languageCode` once as well when your code starts up.

## Texts of your own in the car's language

SmartifyOS uses the [slang](https://pub.dev/packages/slang) package for its texts, and an extension
with texts of its own does the same. Once your slang texts are set up, point them at the car's
language when your code starts, and follow it from then on:

```dart
LocaleSettings.setLocaleRaw(SmartifyOsLanguage.languageCode);
SmartifyOsLanguage.languageChanges.listen(LocaleSettings.setLocaleRaw);
```

That way the whole screen stays in one language, yours included. See
[Making an Extension](../extensions/making-an-extension.md) for where an extension's texts live.

## Switching the language

```dart
SmartifyOsLanguage.setLanguage('de');
```

A language SmartifyOS has no texts in shows English.

TODO: the Language page in Settings has no way to pick a language yet, and the language the car is
in is not remembered between drives yet.
