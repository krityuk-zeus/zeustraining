function displayFactorial() {
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
    
    result.textContent = `factorial of ${num} is ${factorial.join('')}`;
    
}

document.getElementById('submitButton').addEventListener('click', displayFactorial);


function multiplyNumbers(arr,b) {
    // arr is array of digit, b is a number
    // arr = [5,0,4,0,3,0,0,0,0] b = 23
    let carry = 0;
    let result = [];
    for(let i = arr.length - 1; i >= 0; i--) {
        let product = arr[i] * b + carry;
        result.unshift(product % 10); // get the last digit
        carry = Math.floor(product / 10); // get the carry
    }
    while(carry>0){
        result.unshift(carry % 10); // get the last digit of carry
        carry = Math.floor(carry / 10); // update carry
    }
   return result;
}