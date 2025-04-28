const ImageDisplay = ({ imageId }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    axios.get(`/api/image/${imageId}`).then(res => setImageUrl(res.data.url));
  }, [imageId]);

  return imageUrl && <img src={imageUrl} alt="Uploaded from S3" />;
};
