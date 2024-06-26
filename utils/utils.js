const { ZodError } = require("zod")

function Try(tryable){
	try{
		return [tryable(), undefined]
	}catch(e){
		return [undefined, e]	
	}
}


function decycle(obj, stack = []) {
    if (!obj || typeof obj !== 'object')
        return obj;

    if (stack.includes(obj))
        return null;

    let s = stack.concat([obj]);

    return Array.isArray(obj)
        ? obj.map(x => decycle(x, s))
        : Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, decycle(v, s)]));
  }



module.exports = {
	Try,
	decycle
}
