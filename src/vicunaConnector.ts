let expireCounter = 0;
const MAX_RETRY_TIME = 3;

// {
//   "model": "string",
//   "messages": "string",
//   "temperature": 0.7,
//   "top_p": 1,
//   "top_k": -1,
//   "n": 1,
//   "max_tokens": 0,
//   "stop": "string",
//   "stream": false,
//   "presence_penalty": 0,
//   "frequency_penalty": 0,
//   "user": "string"
// }
/**
 *openai call function
 */
export const callOpenAI = async (messages: string, options?: Object) => {
  const countTokenParams = {
    prompts: [
      {
        model: "vicuna_7b_pubmed",
        prompt: messages,
        max_tokens: 100000000,
      },
    ],
  };
  const generateParams = {
    model: "vicuna_7b_pubmed",
    messages: [
      {
        role: "user",
        content: `Generate a text summary of this text with COT, which means you should generate summary step by step and show me your process
        Step 1: Read the text and identify the main points.
        Step 2 generate your summary with these points.
        Your summary should contain these two parts or more.
        ${messages}`,
      },
    ],
    temperature: 0.7,
    top_p: 1,
    top_k: -1,
    n: 1,
    max_tokens: 10000,
    stream: true,
    presence_penalty: 0,
    frequency_penalty: 0,
    user: "user",
  };
  let response = null;
  let countTokenResponse = null;
  countTokenResponse = await requestWrapper(
    "/api/v1/token_check",
    countTokenParams,
    options
  );
  console.log(countTokenResponse);

  response = await requestWrapper(
    "/v1/chat/completions",
    generateParams,
    options
  );
  return response;
};

type methodType = "GET" | "POST" | "PUT" | "DELETE";
/**
 * This function is used to send a request to the backend, including the user's uid and token, uid is used to identify the user, and token is used to verify the user's identity, uid is stored in the body and accessToken is stored in the header
 * @param requestURL The URL of the request backend, request already have base url so you just need to pass the path like '/api/xxx'
 * @param body The body of the request
 * @returns The response of the backend
 */
export const requestWrapper = async (
  requestURL: string,
  body: Object,
  options?: {
    method?: methodType;
    signal?: AbortSignal;
  }
): Promise<number | Response> => {
  const { method, signal } = options ?? {};
  const bodyString = JSON.stringify(body);
  const requestOptions: any = {
    method: method ?? "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const response = await fetch(
      import.meta.env.VITE_BASE_PAPER_SHRINK_REQUEST_URL + requestURL,
      {
        ...requestOptions,
        body: bodyString,
        signal,
      }
    );
    if (response.ok) {
      return response;
    } else {
      if (expireCounter < MAX_RETRY_TIME) {
        // refresh token
        expireCounter++;
        return requestWrapper(requestURL, body, options);
      } else {
        expireCounter = 0;
        return response.status;
      }
    }
  } catch (error: any) {
    console.log("fetch error");
    throw error;
  }
};
