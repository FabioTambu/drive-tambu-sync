// Execute real component handlers while replacing only React/JSX and native APIs.
// This does not emulate React rendering effects or a real Electron window.
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path'),ts=require('typescript'),assert=require('node:assert/strict')
let active
const react={
 useState(initial){const state=active,i=state.cursor++;if(!(i in state.slots))state.slots[i]=typeof initial==='function'?initial():initial;return [state.slots[i],v=>{state.slots[i]=typeof v==='function'?v(state.slots[i]):v}]},
 useRef(value){const state=active,i=state.cursor++;if(!(i in state.slots))state.slots[i]={current:value};return state.slots[i]},
 useEffect(){active.cursor++},useCallback(fn){active.cursor++;return fn},useMemo(fn){active.cursor++;return fn()}
}
const jsx={jsx:(type,props)=>({type,props:props||{}}),jsxs:(type,props)=>({type,props:props||{}}),Fragment:'fragment'}
const filename=path.resolve(__dirname,'../../src/renderer/src/App.tsx'),m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(path.dirname(filename))
const old=Module._load
try{
 Module._load=function(id,...args){if(id==='react')return react;if(id==='react/jsx-runtime')return jsx;if(id==='lucide-react')return new Proxy({},{get:(_t,key)=>props=>({type:'svg',props:{...props,'data-icon':key}})});return old.call(this,id,...args)}
 const out=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}})
 m._compile(out.outputText+'\nexports.testComponents={MountModal,MountCard,SettingsPage,ScheduleFields:typeof ScheduleFields===\'function\'?ScheduleFields:null};',filename)
}finally{Module._load=old}
function expand(n){if(n==null||typeof n==='boolean')return [];if(Array.isArray(n))return n.flatMap(expand);if(typeof n!=='object')return [n];if(typeof n.type==='function')return expand(n.type(n.props));return [{...n,children:expand(n.props.children)}]}
const flat=nodes=>nodes.flatMap(n=>typeof n==='object'?[n,...flat(n.children||[])]:[n])
const text=nodes=>flat(nodes).filter(n=>typeof n==='string'||typeof n==='number').join(' ').trim()
function renderComponent(name,props){
 const component=m.exports.testComponents[name];assert.equal(typeof component,'function',`${name} is implemented`)
 const state={slots:[],cursor:0};const render=()=>{active=state;state.cursor=0;return expand(component(props))}
 const find=predicate=>{const value=flat(render()).find(predicate);assert.ok(value,'Expected control exists');return value}
 return {render,find,props,byLabel:label=>find(n=>n.props?.['aria-label']===label),button:label=>find(n=>n.type==='button'&&(n.props['aria-label']===label||text(n.children)===label))}
}
module.exports={renderComponent,text,flat}
