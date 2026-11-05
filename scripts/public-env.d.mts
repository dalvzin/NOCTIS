export function assertPublicEnvironment(values:Record<string,string|undefined>):void;
export function checkViteEnvironment(mode:string,loadEnv:(mode:string,dir:string,prefix:string)=>Record<string,string>):void;
