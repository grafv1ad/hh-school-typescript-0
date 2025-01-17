// Test utils

const testBlock = (name: string): void => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const areEqual = (a: unknown, b: unknown): boolean => {
    // Compare arrays of primitives
    // Remember: [] !== []
    if (a instanceof Array && b instanceof Array) {
        if (a.length !== b.length) {
            return false;
        }
        return a.toString() === b.toString();
        // Вначале сделал сравнение всех элементов через every,
        // но отказался от этой реализации, когда дело дошло
        // до ступенчатых массивов в последних тестах
    }
    return a === b;
};

const test = (whatWeTest: string, actualResult: unknown, expectedResult: unknown): void => {
    if (areEqual(actualResult, expectedResult)) {
        console.log(`[OK] ${whatWeTest}\n`);
    } else {
        console.error(`[FAIL] ${whatWeTest}`);
        console.debug('Expected:');
        console.debug(expectedResult);
        console.debug('Actual:');
        console.debug(actualResult);
        console.log('');
    }
};

// Functions

const getType = (value: unknown): string => {
    // Return string with a native JS type of value
    return typeof value;
};

const getTypesOfItems = (arr: Array<unknown>): Array<string> => {
    // Return array with types of items of given array
    return arr.map((item) => getType(item));
};

const allItemsHaveTheSameType = (arr: Array<unknown>): boolean => {
    // Return true if all items of array have the same type
    const types: Array<string> = getTypesOfItems(arr);
    return types.every((item) => item === types[0]);
};

const getRealType = (value: unknown): string => {
    // Return string with a “real” type of value.
    // For example:
    //     typeof new Date()       // 'object'
    //     getRealType(new Date()) // 'date'
    //     typeof NaN              // 'number'
    //     getRealType(NaN)        // 'NaN'
    // Use typeof, instanceof and some magic. It's enough to have
    // 12-13 unique types but you can find out in JS even more :)
    const type: string = typeof value;
    switch (type) {
        case 'number':
            if (Number.isNaN(value)) {
                return 'NaN';
            }
            if (Number.isFinite(value)) {
                return type;
            }
            return 'Infinity';
        case 'object':
            if (value === null) {
                return 'null';
            }
            if (value instanceof Array) {
                return 'array';
            }
            if (value instanceof Date) {
                return 'date';
            }
            if (value instanceof RegExp) {
                return 'regexp';
            }
            if (value instanceof Set) {
                return 'set';
            }
            if (value instanceof Event) {
                return 'event';
            }
            break;
        default:
            break;
    }
    return type;
};

const getRealTypesOfItems = (arr: Array<unknown>): Array<string> => {
    // Return array with real types of items of given array
    return arr.map((item) => getRealType(item));
};

const everyItemHasAUniqueRealType = (arr: Array<unknown>): boolean => {
    // Return true if there are no items in array
    // with the same real type
    const types: Array<string> = [];
    return arr.every((item) => {
        const type: string = getRealType(item);
        if (types.includes(type)) {
            return false;
        }
        types.push(type);
        return true;
    });
};

const countRealTypes = (arr: Array<unknown>): Array<[string, number]> => {
    // Return an array of arrays with a type and count of items
    // with this type in the input array, sorted by type.
    // Like an Object.entries() result: [['boolean', 3], ['string', 5]]
    interface ITypes {
        [index: string]: number;
    }
    const types: ITypes = {};
    arr.forEach((item) => {
        const type = getRealType(item);
        if (types[type]) {
            types[type] += 1;
        } else {
            types[type] = 1;
        }
    });
    return Object.entries(types).sort((a, b) => a[0].localeCompare(b[0]));
};

// Tests

testBlock('areEqual');

test('Equal', areEqual(123, 123), true);
test('Number and string', areEqual(321, '321'), false);
test('Equal arrays', areEqual([1, 2], [1, 2]), true);
test('Not equal arrays', areEqual([1, 2], [1, 3]), false);
test('Different types', areEqual(['array'], true), false);

testBlock('getType');

test('Boolean', getType(true), 'boolean');
test('Number', getType(123), 'number');
test('String', getType('whoo'), 'string');
test('Array', getType([]), 'object');
test('Object', getType({}), 'object');
test(
    'Function',
    getType(() => {}),
    'function'
);
test('Undefined', getType(undefined), 'undefined');
test('Null', getType(null), 'object');

testBlock('allItemsHaveTheSameType');

test('All values are numbers', allItemsHaveTheSameType([11, 12, 13]), true);

test('All values are strings', allItemsHaveTheSameType(['11', '12', '13']), true);

test('All values are strings but wait', allItemsHaveTheSameType(['11', new String('12'), '13']), false);

// @ts-expect-error
test('Values like a number', allItemsHaveTheSameType([123, 123 / 'a', 1 / 0]), true);

test('Values like an object', allItemsHaveTheSameType([{}]), true);

test('Empty array', allItemsHaveTheSameType([]), true);

testBlock('getTypesOfItems VS getRealTypesOfItems');

const knownTypes: Array<unknown> = [
    true,
    420,
    'You found an Easter egg! 🥚️',
    [1, 2, 3],
    { hello: 'world' },
    () => ';)',
    undefined,
    null,
    +'NaN',
    1 / 0,
    new Date('1961-04-12T09:07'),
    /Gagarin/gi,
    new Set(),
    Symbol('~_~'),
    999999999999999969n,
    new Event('Таких объектов сюда можно написать еще кучу, но это не имеет смысла, так что на этом закончим)'),
];

test('Check basic types', getTypesOfItems(knownTypes), [
    'boolean',
    'number',
    'string',
    'object', // array
    'object',
    'function',
    'undefined',
    'object', // null
    'number', // NaN
    'number', // Infinity
    'object', // date
    'object', // regexp
    'object', // set
    'symbol',
    'bigint',
    'object', // event
]);

test('Check real types', getRealTypesOfItems(knownTypes), [
    'boolean',
    'number',
    'string',
    'array',
    'object',
    'function',
    'undefined',
    'null',
    'NaN',
    'Infinity',
    'date',
    'regexp',
    'set',
    'symbol',
    'bigint',
    'event',
]);

test('Empty array', getRealTypesOfItems([]), []);

testBlock('everyItemHasAUniqueRealType');

test('All value types in the array are unique', everyItemHasAUniqueRealType([true, 123, '123']), true);

// @ts-expect-error
test('Two values have the same type', everyItemHasAUniqueRealType([true, 123, '123' === 123]), false);

test('There are no repeated types in knownTypes', everyItemHasAUniqueRealType(knownTypes), true);

test('Empty array', everyItemHasAUniqueRealType([]), true);

testBlock('countRealTypes');

test('Count unique types of array items', countRealTypes([true, null, !null, !!null, {}]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

test('Counted unique types are sorted', countRealTypes([{}, null, true, !null, !!null]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

test('Empty array', countRealTypes([]), []);
