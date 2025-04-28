import { useEffect, useState } from "react";
import axios from "axios";

const ArticleDisplay = ({ imageId }) => {
  const [article, setArticle] = useState("");

  useEffect(() => {
    axios.get(`/api/article/${imageId}`).then(res => setArticle(res.data.article));
  }, [imageId]);

  return <p>{article}</p>;
};
