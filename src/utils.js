//Index 0 -> :regional_indicator_a:
//Index 1 -> :regional_indicator_b:

//Index 2 -> :regional_indicator_c:
//and so on

module.exports = {
  indexToEmoji: function (index) {
    if (index < 0 || index > 26) {
      return "";
    }
    return "regional_indicator_" + String.fromCharCode(97 + index);
    
  },
};
