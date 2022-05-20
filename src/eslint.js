module.exports = {
  rules: {
    // 函数 () 前空格控制
    'space-before-function-paren': [
      2,
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    // => 前后需要有空格
    'arrow-spacing': 2
  }
}
