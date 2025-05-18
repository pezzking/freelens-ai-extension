import React from "react";
import "./Message.scss";
import MarkdownViewer from "../markdownViewer/MarkdownViewer";

export type MessageType = {
  text: string;
  sent: boolean;
};

export type MessageProps = {
  message: MessageType;
};

const markdown = `
### Summary 📃
The error message "ImagePullBackOff" indicates that Kubernetes is unable to pull the specified container image for a pod.


### Diagnosis 🔎
-   Incorrect image name or tag specified in the pod configuration.,
-   Image registry authentication issues.,
-   Network connectivity problems preventing the cluster from reaching the image registry.,



### Impact Assessment ⚠️
-   Pods that can't pull their images will fail to start or restart, potentially causing services to become unavailable.,
-   Continuously failing attempts to pull images can lead to resource wastage and hinder scaling or deployment processes.,

### Recommended Actions 🚀 

1.  Verify the correctness of the image name and tag in the pod specification.,
2.  Ensure proper authentication is configured if the image is hosted in a private registry.,
3.  Check network settings to ensure the cluster can access the image registry.,
4.  Manually pull the image on a node to test connectivity and authentication:,

~~~bash
docker pull <image-name>:<tag>
~~~

:rocket:
:gear:

You can list docker pods with this command
~~~bash
echo 1
echo 12
echo 123
~~~

~~~python
class Test:
    def __init__(self):
        self.__test = test

if __name__ == '__main__':
    t = Test()
~~~

5.  Monitor the cluster for any recurring failures and investigate further if needed.,

### Reference Material 📚

-   [Troubleshoot Images](https://kubernetes.io/docs/tasks/debug-application-cluster/troubleshooting/slow-images/),
-   [Kubernetes Image Pull Policy](https://kubernetes.io/docs/concepts/containers/images/#updating-and-replacing-images)
-   [This is an external link to genome.gov](https://www.genome.gov/)
`

const Message = ({message}: MessageProps) => {
  const className = message.sent ? "message-bubble sent" : "message-bubble";

  if (message.sent) {
    return (
      <div className={className}>
        {message.text}
      </div>
    )
  } else {
    return (
      <MarkdownViewer content={markdown}/>
    )
  }
}

export default Message;
