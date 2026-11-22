const program = (body, imports = '"fmt"') =>
  `package main\n\nimport ${imports}\n\nfunc main() {\n${body}\n}\n`;

export const course = {
  id: "go",
  name: "Go",
  modules: [
    {
      title: "Go fundamentals",
      lessons: [
        {
          id: "hello-go", title: "Hello, Go!", minutes: 5,
          intro: "Write your first Go program and see how its pieces fit together.",
          concepts: [
            ["package main", "Tells Go to build a program you can run."],
            ['import "fmt"', "Brings in formatting and printing functions."],
            ["func main()", "The function where your program begins."]
          ],
          task: 'Change the message inside <code>fmt.Println</code> so the program prints <strong>Hello, Go!</strong>',
          hints: ['Keep the message between double quotes. <code>fmt.Println</code> prints whatever string you pass to it.'],
          initial: program('\tfmt.Println("Hello, world!")'),
          solution: program('\tfmt.Println("Hello, Go!")'),
          expected: "Hello, Go!"
        },
        {
          id: "variables", title: "Variables & types", minutes: 8,
          intro: "Give values names so you can reuse them. Inside a function, := declares a variable and lets Go infer its type.",
          concepts: [
            ["name := \"Gopher\"", "Declares a string variable with an inferred type."],
            ["var score int", "Declares an integer with its zero value, 0."],
            ["fmt.Println(a, b)", "Prints two values separated by a space."]
          ],
          task: 'Declare a variable named <code>name</code> with the value <code>"Gopher"</code> and a variable named <code>level</code> with the value <code>1</code>. Print both on the same line.',
          hints: ['Write <code>name := "Gopher"</code> inside <code>main</code>.', 'Pass both variables as arguments to <code>fmt.Println</code>.'],
          initial: program('\t// Declare your variables and print them here.'),
          solution: program('\tname := "Gopher"\n\tlevel := 1\n\tfmt.Println(name, level)'),
          expected: "Gopher 1", required: ["variable"]
        },
        {
          id: "conditionals", title: "Conditionals", minutes: 8,
          intro: "Use if and else to choose what a program does based on a condition. Go requires braces around each branch.",
          concepts: [
            ["if score >= 70", "Runs a block only when the comparison is true."],
            ["} else {", "Runs the fallback block if the condition is false."]
          ],
          task: 'Use an <code>if</code> statement to print <code>Pass</code> when <code>score</code> is 70 or higher. Print <code>Try again</code> otherwise.',
          hints: ['Place the comparison directly after <code>if</code> and open a brace on that line.', 'Put <code>else</code> on the same line as the closing brace of the first block.'],
          initial: program('\tscore := 74\n\t// Add the decision here.'),
          solution: program('\tscore := 74\n\tif score >= 70 {\n\t\tfmt.Println("Pass")\n\t} else {\n\t\tfmt.Println("Try again")\n\t}'),
          expected: "Pass", required: ["if"]
        },
        {
          id: "loops", title: "Loops", minutes: 10,
          intro: "A for loop repeats a block while its condition is true. It can have an initializer and an update step.",
          concepts: [
            ["for i := 1; i <= 3; i++", "Starts at 1, includes 3, and increments after each iteration."],
            ["total += i", "Adds the current value of i to total."]
          ],
          task: 'Use a <code>for</code> loop to add the integers from 1 through 5. Print the total once the loop finishes.',
          hints: ['Start with <code>total := 0</code>. In your loop, add <code>i</code> to <code>total</code>.', 'Use <code>i <= 5</code> to include the last number.'],
          initial: program('\ttotal := 0\n\t// Add the numbers from 1 through 5.\n\tfmt.Println(total)'),
          solution: program('\ttotal := 0\n\tfor i := 1; i <= 5; i++ {\n\t\ttotal += i\n\t}\n\tfmt.Println(total)'),
          expected: "15", required: ["for"]
        }
      ]
    },
    {
      title: "Functions & collections",
      lessons: [
        {
          id: "functions", title: "Functions", minutes: 10,
          intro: "A function names a piece of work. Its signature describes the values it takes and the value it returns.",
          concepts: [
            ["func add(a, b int) int", "Declares two integer parameters and an integer result."],
            ["return a + b", "Sends the computed value back to the caller."]
          ],
          task: 'Complete <code>multiply</code> so it returns the product of its two parameters. The starter calls it twice.',
          hints: ['Use <code>*</code> to multiply. Return an expression that uses both <code>a</code> and <code>b</code>.'],
          initial: program('\tfmt.Println(multiply(6, 7))\n\tfmt.Println(multiply(-2, 5))') + '\nfunc multiply(a, b int) int {\n\treturn 0\n}\n',
          solution: program('\tfmt.Println(multiply(6, 7))\n\tfmt.Println(multiply(-2, 5))') + '\nfunc multiply(a, b int) int {\n\treturn a * b\n}\n',
          expected: "42\n-10", required: ["function"]
        },
        {
          id: "slices", title: "Slices", minutes: 10,
          intro: "A slice gives you an ordered collection of elements. It can grow when you append items and save the returned slice.",
          concepts: [
            ['[]string{"Go", "Rust"}', "Creates a slice containing two strings."],
            ["items = append(items, value)", "Appends an item and stores the returned slice."],
            ["items[0]", "Reads the first element. Go indexes start at zero."]
          ],
          task: 'Append <code>"pear"</code> to <code>fruit</code>, then print the number of items and the last item on one line.',
          hints: ['Use <code>fruit = append(fruit, "pear")</code>.', 'Get the last index with <code>len(fruit) - 1</code>.'],
          initial: program('\tfruit := []string{"apple", "banana"}\n\t// Append one fruit and print the result.\n\tfmt.Println(fruit)'),
          solution: program('\tfruit := []string{"apple", "banana"}\n\tfruit = append(fruit, "pear")\n\tfmt.Println(len(fruit), fruit[len(fruit)-1])'),
          expected: "3 pear", required: ["append"]
        },
        {
          id: "maps", title: "Maps", minutes: 10,
          intro: "Maps store values under keys. Looking up a key gives its value and, optionally, a boolean indicating whether it exists.",
          concepts: [
            ['map[string]int{"Go": 3}', "Creates a map with string keys and integer values."],
            ['levels["Go"]++', "Increments the value stored under the key Go."],
            ['value, ok := levels["Go"]', "Reads a value and whether its key exists."]
          ],
          task: 'Add 2 to the value for <code>"Go"</code> in <code>scores</code> and print the updated value.',
          hints: ['Read or update the value using <code>scores["Go"]</code>.', 'Use <code>+= 2</code> to update the map entry in place.'],
          initial: program('\tscores := map[string]int{"Go": 3, "Rust": 4}\n\t// Update the Go score.\n\tfmt.Println(scores["Go"])'),
          solution: program('\tscores := map[string]int{"Go": 3, "Rust": 4}\n\tscores["Go"] += 2\n\tfmt.Println(scores["Go"])'),
          expected: "5", required: ["map"]
        },
        {
          id: "structs", title: "Structs", minutes: 12,
          intro: "A struct groups related fields into a single value. Define a type once and use it to represent many values with the same shape.",
          concepts: [
            ["type Book struct { … }", "Defines a named struct type with its fields inside the braces."],
            ['Book{Title: "Go Basics"}', "Creates a Book by naming the field to initialize."],
            ["book.Title", "Accesses the Title field of book."]
          ],
          task: 'Add a <code>Pages int</code> field to <code>Book</code>. Initialize it to <code>120</code>, then print the title and page count.',
          hints: ['Add <code>Pages int</code> on a new line inside the struct.', 'Add <code>Pages: 120</code> to the struct literal after a comma.'],
          initial: 'package main\n\nimport "fmt"\n\ntype Book struct {\n\tTitle string\n}\n\nfunc main() {\n\tbook := Book{Title: "Go Basics"}\n\tfmt.Println(book.Title)\n}\n',
          solution: 'package main\n\nimport "fmt"\n\ntype Book struct {\n\tTitle string\n\tPages int\n}\n\nfunc main() {\n\tbook := Book{Title: "Go Basics", Pages: 120}\n\tfmt.Println(book.Title, book.Pages)\n}\n',
          expected: "Go Basics 120", required: ["struct"]
        }
      ]
    },
    {
      title: "Practical Go",
      lessons: [
        {
          id: "errors", title: "Handling errors", minutes: 12,
          intro: "Go functions often return an error alongside their result. A nil error means the operation succeeded.",
          concepts: [
            ["n, err := strconv.Atoi(text)", "Tries to convert a string to an integer."],
            ["if err != nil", "Checks whether the conversion failed."],
            ["return", "Exits the current function early."]
          ],
          task: 'Check the error from <code>strconv.Atoi</code>. If the input is invalid, print <code>Invalid number</code> and exit <code>main</code>. Otherwise print the parsed number.',
          hints: ['Replace <code>_</code> with <code>err</code> to keep the error.', 'Put <code>return</code> after printing the error message so the success path does not run as well.'],
          initial: program('\tn, _ := strconv.Atoi("gopher")\n\t// Check for an error before printing n.\n\tfmt.Println(n)', '(\n\t"fmt"\n\t"strconv"\n)'),
          solution: program('\tn, err := strconv.Atoi("gopher")\n\tif err != nil {\n\t\tfmt.Println("Invalid number")\n\t\treturn\n\t}\n\tfmt.Println(n)', '(\n\t"fmt"\n\t"strconv"\n)'),
          expected: "Invalid number", required: ["if", "nil check"]
        },
        {
          id: "defer", title: "Defer & cleanup", minutes: 8,
          intro: "A deferred call runs when the enclosing function returns. This is useful for cleanup that should happen even when the function exits early.",
          concepts: [
            ['defer fmt.Println("Done")', "Schedules the print call for the end of the function."],
            ["Last in, first out", "When you defer several calls, the most recent runs first."]
          ],
          task: 'Keep the two print statements in their current order and add <code>defer</code> so <code>Working</code> prints before <code>Done</code>.',
          hints: ['Add the <code>defer</code> keyword in front of the call you want to execute last.'],
          initial: program('\tfmt.Println("Done")\n\tfmt.Println("Working")'),
          solution: program('\tdefer fmt.Println("Done")\n\tfmt.Println("Working")'),
          expected: "Working\nDone", required: ["defer"]
        },
        {
          id: "goroutines", title: "Goroutines & channels", minutes: 14,
          intro: "A goroutine runs a function concurrently. A channel lets one goroutine send a value to another and can synchronize their work.",
          concepts: [
            ["make(chan string)", "Creates a channel that carries strings."],
            ["go func() { … }()", "Starts an anonymous function in a new goroutine."],
            ["messages <- value / <-messages", "Sends a value or receives the next value."]
          ],
          task: 'Start a goroutine that sends <code>"Ready"</code> on <code>messages</code>. In <code>main</code>, receive the message and print it.',
          hints: ['Call the anonymous function with <code>()</code> after its closing brace.', 'Use <code>fmt.Println(&lt;-messages)</code> to wait for and print the value.'],
          initial: program('\tmessages := make(chan string)\n\t// Start a goroutine that sends a message.\n\t// Replace this line with a print of the received message.\n\tfmt.Println(messages)'),
          solution: program('\tmessages := make(chan string)\n\tgo func() {\n\t\tmessages <- "Ready"\n\t}()\n\tfmt.Println(<-messages)'),
          expected: "Ready", required: ["goroutine", "channel"]
        },
        {
          id: "word-tally", title: "Project: Word tally", minutes: 15,
          intro: "Build a small word counter using three pieces you already know: slices, loops, and maps.",
          concepts: [
            ["strings.Fields(text)", "Splits text into a slice of words at whitespace."],
            ["for _, word := range words", "Loops over the slice values and discards the index."],
            ["counts[word]++", "Increments a count. Missing keys start at zero."]
          ],
          task: 'Split <code>text</code> into words and count each occurrence in <code>counts</code>. The final two lines print the counts for <code>go</code> and <code>learn</code>.',
          hints: ['Use <code>strings.Fields(text)</code> to get the words.', 'In a <code>range</code> loop, increment <code>counts[word]</code> for each word.'],
          initial: program('\ttext := "go learn go practice learn go"\n\tcounts := map[string]int{}\n\t// Split the text and tally each word.\n\tfmt.Println("go:", counts["go"])\n\tfmt.Println("learn:", counts["learn"])', '(\n\t"fmt"\n\t"strings"\n)'),
          solution: program('\ttext := "go learn go practice learn go"\n\tcounts := map[string]int{}\n\tfor _, word := range strings.Fields(text) {\n\t\tcounts[word]++\n\t}\n\tfmt.Println("go:", counts["go"])\n\tfmt.Println("learn:", counts["learn"])', '(\n\t"fmt"\n\t"strings"\n)'),
          expected: "go: 3\nlearn: 2", required: ["map", "range"]
        }
      ]
    }
  ]
};

export const playgroundCode = program('\tfmt.Println("Hello from the playground!")');
