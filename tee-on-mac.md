## 安装 Ubuntu 18.04 


#### 安装qemu：

`brew install qemu`

查看版本：

`qemu-system-x86_64 --version`
```
QEMU emulator version 4.2.0
Copyright (c) 2003-2019 Fabrice Bellard and the QEMU Project developers
```

#### 下载 Ubuntu 18.04 镜像
https://ubuntu.com/download/desktop

#### 创建磁盘镜像
`qemu-img create -q -f qcow2 ubuntu.img 80G`

#### 启动虚拟机并载入 ISO 文件
`qemu-system-x86_64 -m 4096 -cdrom ubuntu-18.04.4-desktop-amd64.iso --enable-kvm -accel hvf ubuntu.img`

参数说明：

`-m 4096`：为虚拟机分配 4G 内存

`--enable-kvm -accel hvf`：启用mac环境下硬件加速功能

#### 安装 ubuntu 
选择最小化安装即可，具体可参考：
https://graspingtech.com/ubuntu-desktop-18.04-virtual-machine-macos-qemu/

安装完成后，关闭系统，去掉 ISO 文件挂载再次启动：

`qemu-system-x86_64 -m 4096 --enable-kvm -accel hvf ubuntu.img -vga virtio -show-cursor -net user,hostfwd=tcp::2222-:22 -net nic -smp 4,sockets=1,cores=2`

参数说明：

`-vga virtio`: 启用图形界面加速

`-net user,hostfwd=tcp::2222-:22 -net nic`：虚拟机内 22 端口映射到 host 2222端口

`-smp 4,sockets=1,cores=2`：模拟一个双核4线程 cpu

#### 配置 ssh
虚拟机启动后，安装 openssh 服务：

`sudo apt update`

`sudo apt install openssh`

在 host 上面 ssh 到虚拟机：

`ssh user@localhost -p 2222`


## 编译内核
#### 安装依赖项
登录到 ubuntu

`sudo apt update`

`sudo apt install libncurses5-dev flex bison`

#### 下载内核
```
$ mkdir kernel
$ cd kernel
$ wget https://cdn.kernel.org/pub/linux/kernel/v4.x/linux-4.19.109.tar.xz
$ tar xvf linux-4.19.109.tar.xz
```

#### 编译
```
$ cd linux-4.19.109
$ make menuconfig ##这里我使用默认配置了
$ make -j8
```
拷贝编译好的内核到 `~/kernel` 目录
```
$ cp linux-4.19.109/arch/x86_64/boot/bzImage .
```

## 内核上跑 rust 程序

#### 安装 rust 环境
`sudo apt install curl`

`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

`rustup toolchain install nightly`

#### 创建 helloworld
```
$ mkdir rust
$ cd rust
$ cargo --version
cargo 1.42.0 (86334295e 2020-01-31)
$ cargo new --bin hello
$ cd hello
$ cargo build
$ ldd ./target/debug/hello
	linux-vdso.so.1 (0x00007ffe0c9b4000)
	libdl.so.2 => /lib/x86_64-linux-gnu/libdl.so.2 (0x00007f0712ee6000)
	librt.so.1 => /lib/x86_64-linux-gnu/librt.so.1 (0x00007f0712cde000)
	libpthread.so.0 => /lib/x86_64-linux-gnu/libpthread.so.0 (0x00007f0712abf000)
	libgcc_s.so.1 => /lib/x86_64-linux-gnu/libgcc_s.so.1 (0x00007f07128a7000)
	libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f07124b6000)
	/lib64/ld-linux-x86-64.so.2 (0x00007f071331c000)
```
可以看到 rust 默认编译的程序依赖动态库。这样不能运行在内核上，需要静态编译。

#### 静态编译
使用MUSL编译，首先需要安装musl环境：
```
$ sudo apt install musl-tools
$ rustup target add x86_64-unknown-linux-musl
$ rustup target add x86_64-unknown-linux-musl --toolchain=nightly
$ cargo build --release --target=x86_64-unknown-linux-musl
$ ldd ./target/x86_64-unknown-linux-musl/release/hello
	not a dynamic executable
```

#### 制作 initrd
拷贝静态编译的二进制 hello 到 `~/kernel`。
```
$ cd ~/kernel
$ cp ../rust/hello/target/x86_64-unknown-linux-musl/release/hello .
$ echo hello | cpio -o --format=newc > rootfs
```
这时`~/kernel`里面有有 `bzImage`、`rootfs` 文件。

#### 使用 Qemu 启动内核
这一步我在 Mac 系数操作的。首先拷贝编译好的内核与rootfs。
```
$ mkdir kernel
$ cd kernel
$ scp -P2222 user@localhost:~/kernel/bzImage .
$ scp -P2222 user@localhost:~/kernel/rootfs .
$ qemu-system-x86_64 -m 1024 -kernel ./bzImage -initrd ./rootfs -append "rdinit=/hello"
```


## 参考
mac上使用 qemu 安装ubuntu：https://graspingtech.com/ubuntu-desktop-18.04-virtual-machine-macos-qemu/

qemu cpu 配置：https://www.cnblogs.com/pengdonglin137/articles/5023994.html

kernel 上跑hello world 程序：https://blog.csdn.net/sinat_22597285/article/details/53783221

kernel 消息打印到窗口：https://blog.csdn.net/zinnc/article/details/81351170

搭建 qemu kernel 开发环境：https://blog.csdn.net/weixin_38227420/article/details/88402738

rust 静态编译：https://blog.csdn.net/castellan/article/details/86063775
