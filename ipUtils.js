
module.exports = {
  sortByPrefixLength : function (a, b) {
      const netA = a.split("/")[1];
      const netB = b.split("/")[1];

      return netA - netB;
  }

};