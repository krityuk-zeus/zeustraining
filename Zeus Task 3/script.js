function displayFactorial() {
    console.time("Execution Time");
    const num = document.getElementById('numberInput').value;
    const result = document.getElementById('result'); // result var is having ref, its not local variable so no need to use setState
    if(!num){
        result.textContent = 'Please enter a number.';return;
    }
    //
    // let factorial = 1;
    // for(let i= 1; i<=num;i++){
    //     factorial *=i;
    // }
    // result.textContent = `factorial of ${num} is ${factorial}`;
    let factorial = [1];
    for(let i= 1; i<=num;i++){
        factorial = multiplyNumbers(factorial, i);
    }
    
    result.textContent = `factorial of ${num} is ${factorial.join(' ')}`;
    console.timeEnd("Execution Time");
    alert(`Time taken is ${performance.now().toFixed(2)} ms`);

}

document.getElementById('submitButton').addEventListener('click', displayFactorial);



function multiplyNumbers(arr,b) {
    // arr is array of digit, b is a number
    // arr = [5,0,4,0,3,0,0,0,0] b = 23
    let carry = 0;
    let result = [];
    for(let i = arr.length - 1; i >= 0; i--) {     // 5040 3000 5340 0000 * 23
        let product = arr[i] * b + carry; 
        // NOTE HERE YOU SHOULD TAKE AS BIG RADIX AS POSSIBLE, BUT MAKE SURE arr[i] * b + carry not exceed 9e15 as it is javascript number limit 
        // if we keep radix = 10000000, then max value of arr[i] is 9999999.
        result.unshift(product % 10000000);
        carry = Math.floor(product / 10000000); // get the carry
    }
    while(carry>0){
        result.unshift(carry % 10000000); // getting the last digit of carry
        carry = Math.floor(carry / 10000000); // updating carry
    }
   return result;
}