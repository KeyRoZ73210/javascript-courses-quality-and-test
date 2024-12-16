const tools = require('../../tools.js');

describe('Tools Module', () => {

    test("getRandomInt should return a valid integer", () => {
        const max = 10;
        for (let i = 0; i < 100; i++) {
            const result = tools.getRandomInt(max);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(max);
        }
    });

    test("replaceAt should replace the character at the specified index", () => {
        const str = "hello";
        const result = tools.replaceAt(str, 1, "a");
        expect(result).toBe("hallo");
    });

    test("replaceAt should return the same string if index is out of bounds", () => {
        const str = "hello";
        const result = tools.replaceAt(str, 10, "a");
        expect(result).toBe("hello");
    });

});
