const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript')
test('all TypeScript and TSX sources parse without compiler recovery',()=>{
 const errors=[]
 function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name)
  if(entry.isDirectory())visit(file)
  else if(/\.tsx?$/.test(file)){
   const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS)
   for(const diagnostic of source.parseDiagnostics){const where=source.getLineAndCharacterOfPosition(diagnostic.start||0);errors.push(`${file}:${where.line+1}:${where.character+1}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText,' ')}`)}
  }
 }}
 visit(path.join(__dirname,'../src'))
 assert.deepEqual(errors,[])
})
