const program = body => `const std = @import("std");

pub fn main() void {
${body}
}
`;

export const sandbox = program(String.raw`    std.debug.print("Hello, Zig!\n", .{});`);

export const modules = [
  {
    title: "The foundations", icon: "terminal", level: "Beginner",
    description: "Read and write your first Zig programs.",
    lessons: [
      {
        id: "hello-zig", title: "Hello, Zig!", minutes: 4, reference: "Hello-World",
        explanation: [
          "Zig starts this program at <code>pub fn main() void</code>. The <code>void</code> return type means the function returns no value.",
          "<code>@import(\"std\")</code> loads Zig’s standard library. <code>std.debug.print</code> writes a formatted message to standard error, which appears in the workbench output. The second argument, <code>.{}</code>, is an empty tuple because the message has no format placeholders."
        ],
        task: 'Run the starter, then change its message to <code>Hello, Zig!</code>. Keep <code>\\n</code> at the end of the string for a newline.',
        starter: program(String.raw`    std.debug.print("Hello, world!\n", .{});`),
        solution: sandbox, expected: "Hello, Zig!",
        hint: 'Change only the text inside the quotation marks. Keep the comma and <code>.{}</code> after the string.'
      },
      {
        id: "variables", title: "Constants & variables", minutes: 5, reference: "Variables",
        explanation: [
          "A <code>const</code> binding cannot be reassigned. Declare a binding with <code>var</code> when you need to change its value. Zig reports an error when a local <code>var</code> is never mutated.",
          "In <code>var score: u32 = 5;</code>, the annotation selects an unsigned 32-bit integer. <code>{d}</code> prints it in decimal, and <code>.{score}</code> supplies the value."
        ],
        task: 'Change the amount added to <code>score</code> so that the program prints <code>12</code>.',
        starter: program(String.raw`    const bonus: u32 = 2;
    var score: u32 = 5;
    score += bonus;
    std.debug.print("{d}\n", .{score});`),
        solution: program(String.raw`    const bonus: u32 = 7;
    var score: u32 = 5;
    score += bonus;
    std.debug.print("{d}\n", .{score});`),
        expected: "12", hint: 'The starting score is <code>5</code>, so <code>bonus</code> should be <code>7</code>.'
      },
      {
        id: "types", title: "Integers & booleans", minutes: 5, reference: "Primitive-Types",
        explanation: [
          "Zig lets you specify integer widths. <code>u8</code> holds values from 0 to 255. <code>i8</code> holds values from −128 to 127.",
          "A comparison like <code>value &gt; 0</code> returns a <code>bool</code>. The <code>{}</code> formatter can display it as <code>true</code> or <code>false</code>."
        ],
        task: 'Pick an <code>i8</code> value so the program prints <code>true</code>.',
        starter: program(String.raw`    const value: i8 = -8;
    const positive: bool = value > 0;
    std.debug.print("{}\n", .{positive});`),
        solution: program(String.raw`    const value: i8 = 8;
    const positive: bool = value > 0;
    std.debug.print("{}\n", .{positive});`),
        expected: "true", hint: 'Any integer from <code>1</code> through <code>127</code> fits the type and passes the comparison.'
      },
      {
        id: "functions", title: "Functions", minutes: 6, reference: "Functions",
        explanation: [
          "A function declares its parameters inside parentheses and its return type immediately afterward. <code>fn double(value: i32) i32</code> takes one <code>i32</code> and returns another.",
          "Call it with <code>double(9)</code>. The result can go directly into the tuple passed to <code>std.debug.print</code>."
        ],
        task: 'Implement <code>double</code> so the two calls print <code>18 10</code>.',
        starter: program(String.raw`    std.debug.print("{d} {d}\n", .{ double(9), double(5) });`) + `
fn double(value: i32) i32 {
    return value;
}
`,
        solution: program(String.raw`    std.debug.print("{d} {d}\n", .{ double(9), double(5) });`) + `
fn double(value: i32) i32 {
    return value * 2;
}
`,
        expected: "18 10", hint: 'Multiply the parameter by two in the <code>return</code> expression.'
      }
    ]
  },
  {
    title: "Control & data", icon: "layers", level: "Core concepts",
    description: "Work with collections, decisions and your own types.",
    lessons: [
      {
        id: "conditionals", title: "If expressions", minutes: 5, reference: "if",
        explanation: [
          "Zig’s <code>if</code> can choose a value. In <code>const label = if (ready) \"go\" else \"wait\";</code>, the chosen string initializes <code>label</code>.",
          "The condition must be a boolean. In this exercise the two branches each supply an integer that fits the explicitly declared result type."
        ],
        task: 'Make <code>larger</code> return the larger of its two arguments. The program should print <code>9 12</code>.',
        starter: program(String.raw`    std.debug.print("{d} {d}\n", .{ larger(9, 4), larger(3, 12) });`) + `
fn larger(a: i32, b: i32) i32 {
    return if (a < b) a else b;
}
`,
        solution: program(String.raw`    std.debug.print("{d} {d}\n", .{ larger(9, 4), larger(3, 12) });`) + `
fn larger(a: i32, b: i32) i32 {
    return if (a > b) a else b;
}
`,
        expected: "9 12", hint: 'Select <code>a</code> when <code>a &gt; b</code>.'
      },
      {
        id: "arrays-slices", title: "Arrays & slices", minutes: 7, reference: "Slices",
        explanation: [
          "<code>[_]u8{ 4, 7, 9, 2 }</code> creates a fixed-length array and lets Zig count the items. A slice is a view into contiguous elements and carries a length.",
          "A range like <code>values[1..3]</code> starts at index 1 and stops before index 3. The <code>[]const u8</code> annotation gives the view a slice type."
        ],
        task: 'Change the slice bounds to select <code>7</code> and <code>9</code>. The output should read <code>7 9 (2 items)</code>.',
        starter: program(String.raw`    const values = [_]u8{ 4, 7, 9, 2 };
    const window: []const u8 = values[0..2];
    std.debug.print("{d} {d} ({d} items)\n", .{ window[0], window[1], window.len });`),
        solution: program(String.raw`    const values = [_]u8{ 4, 7, 9, 2 };
    const window: []const u8 = values[1..3];
    std.debug.print("{d} {d} ({d} items)\n", .{ window[0], window[1], window.len });`),
        expected: "7 9 (2 items)", hint: 'The value <code>7</code> is at index <code>1</code> and the end bound is exclusive.'
      },
      {
        id: "loops", title: "For & while loops", minutes: 7, reference: "for",
        explanation: [
          "<code>for (items) |item|</code> visits each element and binds its value to <code>item</code> for that iteration.",
          "Use <code>while</code> when a boolean should control repetition. A loop such as <code>while (i &lt; 5) : (i += 1)</code> increments <code>i</code> after each iteration."
        ],
        task: 'Accumulate every value in <code>items</code> so the program prints <code>15</code>.',
        starter: program(String.raw`    const items = [_]u32{ 4, 7, 4 };
    var total: u32 = 0;
    for (items) |item| {
        total = item;
    }
    std.debug.print("{d}\n", .{total});`),
        solution: program(String.raw`    const items = [_]u32{ 4, 7, 4 };
    var total: u32 = 0;
    for (items) |item| {
        total += item;
    }
    std.debug.print("{d}\n", .{total});`),
        expected: "15", hint: 'Use <code>+=</code> to add each item to the running total.'
      },
      {
        id: "structs", title: "Structs & methods", minutes: 8, reference: "struct",
        explanation: [
          "A <code>struct</code> groups related fields. Create a value with an initializer such as <code>Rectangle{ .width = 4, .height = 6 }</code>.",
          "A function declared inside the struct can take that struct as its first argument. Calling <code>rect.area()</code> supplies <code>rect</code> as the <code>self</code> argument."
        ],
        task: 'Implement <code>area</code> so the rectangle prints <code>24</code>.',
        starter: program(String.raw`    const rect = Rectangle{ .width = 4, .height = 6 };
    std.debug.print("{d}\n", .{rect.area()});`) + `
const Rectangle = struct {
    width: u32,
    height: u32,

    fn area(self: Rectangle) u32 {
        return self.width;
    }
};
`,
        solution: program(String.raw`    const rect = Rectangle{ .width = 4, .height = 6 };
    std.debug.print("{d}\n", .{rect.area()});`) + `
const Rectangle = struct {
    width: u32,
    height: u32,

    fn area(self: Rectangle) u32 {
        return self.width * self.height;
    }
};
`,
        expected: "24", hint: 'Multiply both fields, accessing them through <code>self</code>.'
      }
    ]
  },
  {
    title: "Thinking in Zig", icon: "cpu", level: "Next steps",
    description: "Handle missing values and failures, then explore memory and comptime.",
    lessons: [
      {
        id: "optionals", title: "Optionals", minutes: 6, reference: "Optionals",
        explanation: [
          "<code>?u32</code> describes a value that is either a <code>u32</code> or <code>null</code>.",
          "<code>value orelse fallback</code> unwraps a present value and evaluates the fallback when the value is null. To branch on presence, you can also use <code>if (value) |present|</code>."
        ],
        task: 'Keep the present value and use <code>10</code> as the fallback for a missing value. The output should read <code>3 10</code>.',
        starter: program(String.raw`    std.debug.print("{d} {d}\n", .{ retries(3), retries(null) });`) + `
fn retries(value: ?u32) u32 {
    return value orelse 0;
}
`,
        solution: program(String.raw`    std.debug.print("{d} {d}\n", .{ retries(3), retries(null) });`) + `
fn retries(value: ?u32) u32 {
    return value orelse 10;
}
`,
        expected: "3 10", hint: 'Change the number after <code>orelse</code>.'
      },
      {
        id: "errors", title: "Errors & recovery", minutes: 8, reference: "Errors",
        explanation: [
          "An error union like <code>InputError!u32</code> holds either a <code>u32</code> or an error from <code>InputError</code>.",
          "<code>catch</code> provides a fallback or handles the error locally. <code>try</code> unwraps success and returns early from the current function when it encounters an error."
        ],
        task: 'Return <code>error.Empty</code> when the input is zero. The calls should print <code>7 99</code> after the second call falls back.',
        starter: program(String.raw`    const good = validated(7) catch 99;
    const empty = validated(0) catch 99;
    std.debug.print("{d} {d}\n", .{ good, empty });`) + `
const InputError = error{Empty};

fn validated(value: u32) InputError!u32 {
    return value;
}
`,
        solution: program(String.raw`    const good = validated(7) catch 99;
    const empty = validated(0) catch 99;
    std.debug.print("{d} {d}\n", .{ good, empty });`) + `
const InputError = error{Empty};

fn validated(value: u32) InputError!u32 {
    if (value == 0) return error.Empty;
    return value;
}
`,
        expected: "7 99", hint: 'Add <code>if (value == 0) return error.Empty;</code> before the existing return.'
      },
      {
        id: "pointers", title: "Pointers & mutation", minutes: 8, reference: "Pointers",
        explanation: [
          "<code>&amp;score</code> takes the address of a variable. A <code>*u32</code> parameter can receive that address, giving the function access to the original value.",
          "Use <code>pointer.*</code> to dereference the pointer. With a mutable pointer type such as <code>*u32</code>, an assignment through it updates the caller’s variable."
        ],
        task: 'Increment the value behind <code>score</code> by one so the program prints <code>42</code>.',
        starter: program(String.raw`    var score: u32 = 41;
    increment(&score);
    std.debug.print("{d}\n", .{score});`) + `
fn increment(score: *u32) void {
    score.* += 0;
}
`,
        solution: program(String.raw`    var score: u32 = 41;
    increment(&score);
    std.debug.print("{d}\n", .{score});`) + `
fn increment(score: *u32) void {
    score.* += 1;
}
`,
        expected: "42", hint: 'The dereference is already in place. Change the amount added to <code>score.*</code>.'
      },
      {
        id: "comptime", title: "Compile-time parameters", minutes: 9, reference: "comptime",
        explanation: [
          "<code>comptime</code> requires an argument to be known at compile time. This allows functions to accept types as arguments and use them in other parameter and return types.",
          "Here, <code>twice</code> takes a type <code>T</code> and a value of that type. The compiler can instantiate the function for both <code>u8</code> and <code>i32</code>."
        ],
        task: 'Make <code>twice</code> return two times its input for both types. The program should print <code>14 -8</code>.',
        starter: program(String.raw`    std.debug.print("{d} {d}\n", .{ twice(u8, 7), twice(i32, -4) });`) + `
fn twice(comptime T: type, value: T) T {
    return value;
}
`,
        solution: program(String.raw`    std.debug.print("{d} {d}\n", .{ twice(u8, 7), twice(i32, -4) });`) + `
fn twice(comptime T: type, value: T) T {
    return value * 2;
}
`,
        expected: "14 -8", hint: 'Return <code>value * 2</code>. The literal <code>2</code> can be coerced to either integer type here.'
      }
    ]
  }
];

export const lessons = modules.flatMap((module, moduleIndex) => module.lessons.map(lesson => ({
  ...lesson, moduleIndex, moduleTitle: module.title
})));
