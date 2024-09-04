module.exports.getRandomInt = function(max) {
    return Math.floor(Math.random() * max);
}

module.exports.replaceAt = function (str,index,chr) {
    if(index > str.length-1) return str;
        return str.substring(0,index) + chr + str.substring(index+1);
}