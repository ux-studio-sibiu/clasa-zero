
export function randomizeArray<T>(array: T[]): T[] {
                return array
                                .map(value => ({ value, sort: Math.random() }))
                                .sort((a, b) => a.sort - b.sort)
                                .map(({ value }) => value);
}

export function selectUniqueElementsFromArray(array: any[], count: number, excludeElements: any[] = []): any[] {
  let newArray: any[] = [];
  const filteredArray = array.filter(element => !excludeElements.includes(element));
  
  while (newArray.length < count && filteredArray.length > 0) {
    const randomElement = filteredArray[Math.floor(Math.random() * filteredArray.length)];
    if (!newArray.includes(randomElement)) {
      newArray.push(randomElement);
    }
  }
  
  return newArray;
}

export function buildArrayFromSequence(array: any[], count: number) {
    const resultArray = [];
    while (resultArray.length < count) {
      for (let i = 0; i < array.length; i++) {
        if (resultArray.length >= count) break;
        resultArray.push(array[i]);
      }
    }
    return resultArray;
}