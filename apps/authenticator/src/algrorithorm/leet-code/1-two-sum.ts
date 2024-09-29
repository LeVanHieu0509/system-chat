/**
 * Input: nums = [2,11,7,15], target = 9
Output: [0,1]
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */

const twoSum = function (nums, target) {
  const object = {};

  for (let i = 0; i < nums.length; i++) {
    const visitValue = target - nums[i]; //get value

    const visitIndex = object[visitValue]; //get index visitValue

    object[nums[i]] = i; //Mỗi lần đi qua là set {value: index}

    if (visitIndex >= 0) {
      return [visitIndex, i];
    }
  }
};

console.log(twoSum([2, 46, 76, 5, 56], 7));
