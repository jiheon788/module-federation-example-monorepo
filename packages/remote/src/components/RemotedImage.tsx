const RemotedImage = ({ src }: { src: string }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        border: "3px solid red",
        padding: "10px",
      }}
    >
      <img src={src} alt="logo" width="100px" height="100px" />
      <caption>
        This image is a component of the Remote-app. ({window.location.href})
      </caption>
    </div>
  );
};

export default RemotedImage;
