import { v4 as uuidv4 } from 'uuid';

export async function generateRandomIntegers(apiKey, count, min, max) {
  const url = 'https://api.random.org/json-rpc/2/invoke';
  const requestBody = {
    jsonrpc: '2.0',
    method: 'generateIntegers',
    params: {
      apiKey: apiKey,
      n: count,
      min: min,
      max: max,
      replacement: true,
    },
    id: uuidv4(),
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Error:', data.error.message);
      return null;
    }

    const randomNumbers = data.result.random.data;
    console.log('Random Integers:', randomNumbers);
    return randomNumbers;
  } catch (error) {
    console.error('Request Failed:', error);
    return null;
  }
}

export default generateRandomIntegers;
