import { axiosCreate, axiosRead } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";

const aiUrl = baseUrl + "/ChatBot";

// Gửi câu hỏi tới AI và nhận câu trả lời
export const sendAiMessage = async (message: string) => {
  const props = {
    data: { message },
    url: aiUrl,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
};

