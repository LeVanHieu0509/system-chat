### Khái niệm

1. K8S là một nền tảng mã nguồn mở quản lý và triển khai các ứng dụng container hóa trên một hệ thống phân tán
2. Nó giúp tự động hóa việc triển khai, quản lý, và mở rộng (scaling) các container
3. Cung cấp các công cụ mạnh mẽ cho việc vận hành các ứng dụng phức tạp.

### Cluster

1. Cluster là một tập hợp các máy chủ (node) mà trên đó Kubernetes quản lý các container
2. Một cluster bao gồm một master node và nhiều worker node

### Node

1. Node là một máy chủ trong cluster (có thể là máy ảo hoặc máy vật lý), nơi mà các ứng dụng container hóa được triển khai.
2. Master Node: Quản lý các worker node, điều phối các hoạt động của cluster và xử lý các yêu cầu API.
3. Worker Node: Nơi chứa các ứng dụng của người dùng, hay chính là nơi chạy các container trong cluster.

### Pod

1. Pod là đơn vị nhỏ nhất có thể triển khai trong Kubernetes. Một pod thường chứa một hoặc nhiều container cùng chia sẻ tài nguyên mạng và lưu trữ.
2. Các container trong một pod thường có mối quan hệ chặt chẽ với nhau và cần phải được triển khai cùng nhau
3. Nếu có một lỗi xảy ra, toàn bộ pod sẽ bị thay thế hoặc khởi động lại thay vì chỉ một container.

### Deployment

1. Deployment là một đối tượng trong Kubernetes giúp quản lý quá trình triển khai các pod. Nó cho phép người dùng định cấu hình về số lượng replica của pod và các chính sách cập nhật.
2. Deployment sẽ giám sát trạng thái của các pod và đảm bảo rằng luôn có đủ số lượng replica đang chạy theo cấu hình mong muốn.

### Service

1. Service cung cấp một IP ổn định và giúp định tuyến yêu cầu đến các pod. Điều này đặc biệt quan trọng vì mỗi lần pod khởi động lại sẽ nhận được một địa chỉ IP mới.
2. Kubernetes Service cung cấp một lớp trừu tượng để đảm bảo rằng các yêu cầu sẽ được định tuyến đến đúng pod, dù IP của pod có thể thay đổi.

### Ingress

1. Ingress là một tài nguyên dùng để định nghĩa các quy tắc định tuyến HTTP và HTTPS đến các service trong cluster.
2. Nó cho phép bạn định cấu hình cách yêu cầu từ bên ngoài (Internet) sẽ được định tuyến vào các ứng dụng chạy bên trong cluster, dựa trên tên miền và đường dẫn URL.

# ConfigMap và Secret

1. ConfigMap: Được dùng để lưu trữ các cấu hình không bảo mật cho ứng dụng, như các biến môi trường, thông tin cấu hình ứng dụng.
2. Secret: Được dùng để lưu trữ các thông tin nhạy cảm như mật khẩu, khóa API, hoặc các thông tin cần được mã hóa khi lưu trữ.

### Namespace

1. Namespace là một không gian logic trong Kubernetes để tách biệt và quản lý tài nguyên. Nó giúp phân chia các tài nguyên 2. trong một cluster lớn thành các nhóm nhỏ hơn, dễ quản lý và có thể có các quyền truy cập riêng.

### Persistent Volume (PV) và Persistent Volume Claim (PVC)

1. Persistent Volume (PV): Là tài nguyên lưu trữ được tạo trong cluster, nó có thể dùng để lưu dữ liệu mà không bị mất khi pod bị xóa.
2. Persistent Volume Claim (PVC): Là yêu cầu được gửi từ người dùng để sử dụng một phần của PV. PVC giúp ứng dụng truy cập vào bộ lưu trữ đã được cấp phát một cách dễ dàng.

### Kubectl

1. Kubectl là công cụ dòng lệnh của Kubernetes, dùng để tương tác với cluster. Với kubectl, người dùng có thể triển khai, quản lý, kiểm tra trạng thái và gỡ lỗi các ứng dụng trong cluster.

### ReplicaSet

1. ReplicaSet đảm bảo rằng một số lượng cụ thể của pod đang chạy trong cluster. Mỗi ReplicaSet giám sát các pod có nhãn phù hợp và khởi tạo thêm nếu có pod nào bị xóa.

### Horizontal Pod Autoscaler (HPA)

1. HPA tự động điều chỉnh số lượng replica của pod dựa trên tài nguyên sử dụng (như CPU, bộ nhớ) để duy trì hiệu suất của ứng dụng.
