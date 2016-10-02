var Exports = require("./transformed.js");

autoTest(Exports.default);

function autoTest(fn) {
  console.log("This function takes", fn.__args.length, "arguments");
  console.log(gen(fn.__args[0]));
}

function gen(type) {
  const genObjectProp = function(def) {
    console.log(def.key.name);
  };
  const genObject = function(def) {
    return def.properties.reduce((acc, prop) => {
      acc[prop.key.name] = generatorFor(prop.value.type)(prop.value);
      return acc;
    }, {});
  };
  const genString = () => "String";
  const genUnion = (def) => def.types.map(x => generatorFor(x.type)(x))[0]; // Take the 0th for now
  const genNull = () => null;
  const lookupGeneric = function(def) {
    const declarationName = def.id.name + "Type";
    if (!Exports[declarationName]) {
      throw new Error("No type declaration found for", def.id.name);
    }
    return gen(Exports[declarationName]);
  };
  const generatorFor = (type) => {
    const generators = {
      "ObjectTypeAnnotation": genObject,
      "GenericTypeAnnotation": lookupGeneric,
      "StringTypeAnnotation": genString,
      "UnionTypeAnnotation": genUnion,
      "NullLiteralTypeAnnotation": genNull
    }
    if (!generators[type]) {
      throw new Error("No type generator found for " + type);
    }
    return generators[type];
  }
  return generatorFor(type.type)(type);
}
