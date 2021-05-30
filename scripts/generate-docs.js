/**
 * Typedoc v0.20 doesn't officially support generation of documentation for projects
 * that have compiler errors. We still have quite a few of them in twinkle-core.
 * Typedoc v0.19.2 does have a --ignoreCompilerErrors option, but there are few
 * worthwhile improvements in v0.20 that makes this custom script worth it.
 *
 * Copied from https://github.com/TypeStrong/typedoc/issues/1403#issuecomment-734475220
 */

// @ts-check

const td = require('typedoc');
const ts = require('typescript');

const app = new td.Application();
// For reading typedoc.json - optional
app.options.addReader(new td.TypeDocReader());
// For reading tsconfig.json - essential
app.options.addReader(new td.TSConfigReader());

app.bootstrap();

const program = ts.createProgram(app.options.getFileNames(), app.options.getCompilerOptions());

// Application.convert checks for compiler errors here.

const project = app.converter.convert(app.expandInputFiles(app.options.getValue('entryPoints')), program);

app.generateDocs(project, app.options.getValue('out'));
