// רץ ברקע (Web Worker) כדי שהורדת המודל והאינדוקס לא יתקעו את המסך
let pipe=null;
const post=(m,t)=>self.postMessage(m,t||[]);
async function wasmUrl(base){const r=await fetch(base+'ort-wasm-simd-threaded.asyncify.wasm.gz');if(!r.ok)throw Error('קובץ ההרצה לא נמצא');let b=new Uint8Array(await r.arrayBuffer());if(b[0]===0x1f&&b[1]===0x8b)b=new Uint8Array(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());return URL.createObjectURL(new Blob([b],{type:'application/wasm'}))}
self.onmessage=async e=>{const m=e.data;
try{if(m.type==='init'){const T=await import(m.base+'transformers.min.js');T.env.allowLocalModels=false;T.env.backends.onnx.wasm.wasmPaths={mjs:m.base+'ort-wasm-simd-threaded.asyncify.mjs',wasm:await wasmUrl(m.base)};T.env.backends.onnx.wasm.numThreads=1;
let pp;try{pp=await T.pipeline('feature-extraction','Xenova/multilingual-e5-small',{dtype:'q8',device:'wasm',progress_callback:p=>{if(p.status==='progress')post({type:'dl',file:p.file||'',loaded:p.loaded||0,total:p.total||0})}})}catch(er){return post({type:'err',model:1,msg:String(er&&er.message||er)})}pipe=pp;post({type:'ready'})}
else if(m.type==='embed'){const o=await pipe(m.texts,{pooling:'mean',normalize:true}),v=o.tolist().map(x=>Float32Array.from(x));post({type:'vecs',id:m.id,vecs:v},v.map(x=>x.buffer))}}
catch(err){post({type:'err',id:m.id,msg:String(err&&err.message||err)})}};
