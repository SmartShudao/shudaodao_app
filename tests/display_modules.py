import sys
import os
from collections import defaultdict


def display_third_party_modules():
    """只显示第三方和自定义模块的简洁版本"""

    # 安全地获取标准库路径
    stdlib_dirs = set()

    # 添加Python安装目录
    if hasattr(sys, 'prefix'):
        stdlib_dirs.add(os.path.abspath(sys.prefix))
    if hasattr(sys, 'base_prefix'):
        stdlib_dirs.add(os.path.abspath(sys.base_prefix))

    # 安全地添加os模块的目录（os模块通常有__file__）
    try:
        if hasattr(os, '__file__') and os.__file__:
            stdlib_dirs.add(os.path.dirname(os.path.abspath(os.__file__)))
    except (AttributeError, TypeError):
        pass

    # 尝试通过其他标准库模块获取路径
    stdlib_module_names = ['collections', 're', 'json', 'datetime', 'types']
    for module_name in stdlib_module_names:
        try:
            module = __import__(module_name)
            if hasattr(module, '__file__') and module.__file__:
                module_dir = os.path.dirname(os.path.abspath(module.__file__))
                stdlib_dirs.add(module_dir)
        except (ImportError, AttributeError, TypeError):
            continue

    print("标准库目录:")
    for dir_path in sorted(stdlib_dirs):
        print(f"  {dir_path}")
    print()

    hierarchy = defaultdict(list)
    third_party_count = 0
    stdlib_count = 0
    builtin_count = 0

    for name, module in sys.modules.items():
        # 跳过None模块
        if module is None:
            continue

        # 检查是否为内置模块（没有__file__属性）
        if not hasattr(module, '__file__') or module.__file__ is None:
            builtin_count += 1
            continue

        module_path = os.path.abspath(module.__file__)

        # 检查是否为标准库模块
        is_stdlib = False
        for stdlib_dir in stdlib_dirs:
            if module_path.startswith(stdlib_dir):
                is_stdlib = True
                break

        if is_stdlib:
            stdlib_count += 1
        else:
            # 第三方或自定义模块
            parts = name.split('.')
            hierarchy[parts[0]].append(name)
            third_party_count += 1

    # 显示统计信息
    print(f"📊 模块统计:")
    print(f"  内置模块: {builtin_count} 个")
    print(f"  标准库模块: {stdlib_count} 个")
    print(f"  第三方/自定义模块: {third_party_count} 个")
    print("=" * 50)

    if third_party_count == 0:
        print("未发现第三方或自定义模块")
        return 0

    print(f"🎯 第三方和自定义模块 (共 {third_party_count} 个):")
    print("=" * 50)

    for base_package in sorted(hierarchy.keys()):
        print(f"📦 {base_package} ({len(hierarchy[base_package])} 个模块)")
        for module in sorted(hierarchy[base_package]):
            module_obj = sys.modules[module]
            file_path = getattr(module_obj, '__file__', '未知路径')
            # 显示相对简洁的路径
            if len(file_path) > 60:
                file_path = "..." + file_path[-57:]
            print(f"   └── {module}")
            print(f"       📁 {file_path}")
        print()

    return third_party_count


# 更简单的版本（如果上面的版本还有问题）
def display_third_party_modules_simple():
    """简化版本，只显示明显的第三方模块"""

    hierarchy = defaultdict(list)
    third_party_count = 0

    # 常见的第三方包名前缀（可以根据需要添加）
    third_party_prefixes = ['numpy', 'pandas', 'requests', 'django', 'flask',
                            'torch', 'tensorflow', 'matplotlib', 'seaborn',
                            'pytest', 'beautifulsoup', 'selenium', 'pillow']

    # 常见的标准库前缀（用于排除）
    stdlib_prefixes = ['os', 'sys', 're', 'json', 'datetime', 'collections',
                       'itertools', 'functools', 'threading', 'multiprocessing',
                       'subprocess', 'pathlib', 'typing', 'abc', 'contextlib']

    for name, module in sys.modules.items():
        if module is None:
            continue

        # 获取包名的根部分
        root_name = name.split('.')[0]

        # 排除标准库模块
        if root_name in stdlib_prefixes:
            continue

        # 如果是明显的第三方包，或者不在标准库前缀中
        if (root_name in third_party_prefixes or
                not any(name.startswith(prefix) for prefix in stdlib_prefixes)):

            # 进一步检查：有__file__且路径不包含标准库关键词
            if hasattr(module, '__file__') and module.__file__:
                module_path = module.__file__.lower()
                stdlib_keywords = ['lib/python', 'site-packages', 'dist-packages']
                if not any(keyword in module_path for keyword in stdlib_keywords):
                    parts = name.split('.')
                    hierarchy[parts[0]].append(name)
                    third_party_count += 1

    print(f"🎯 第三方和自定义模块 (共 {third_party_count} 个)")
    print("=" * 50)

    for base_package in sorted(hierarchy.keys()):
        print(f"📦 {base_package}")
        for module in sorted(hierarchy[base_package]):
            print(f"   └── {module}")

    return third_party_count


# 运行
if __name__ == "__main__":
    try:
        display_third_party_modules()
    except Exception as e:
        print(f"主方法出错: {e}")
        print("尝试使用简化版本...")
        display_third_party_modules_simple()

# import os
# import sys
# from collections import defaultdict
#
#
# def is_builtin_module(module_name, module):
#     """判断是否为内置模块"""
#     # 方法1: 检查模块是否有__file__属性
#     if not hasattr(module, '__file__'):
#         return True
#
#     # 方法2: 检查文件路径是否包含标准库路径
#     if module.__file__ is None:
#         return True
#
#     # 方法3: 检查常见的内置模块名称模式
#     builtin_patterns = ['sys', 'builtins', 'os', 'io', 'codecs', 'time', 'types']
#     if any(module_name == pattern or module_name.startswith(f"{pattern}.")
#            for pattern in builtin_patterns):
#         return True
#
#     # 方法4: 检查文件路径是否在标准库目录中
#     import os
#     stdlib_paths = [sys.prefix, sys.base_prefix]
#     if hasattr(module, '__file__') and module.__file__:
#         module_path = os.path.abspath(module.__file__)
#         for stdlib_path in stdlib_paths:
#             if module_path.startswith(os.path.abspath(stdlib_path)):
#                 return True
#
#     return False
#
#
# def display_modules_hierarchically(exclude_builtin=True):
#     """分层显示模块，可选择排除内置模块"""
#     hierarchy = defaultdict(list)
#
#     for name, module in sys.modules.items():
#         # 排除内置模块
#         if exclude_builtin and is_builtin_module(name, module):
#             continue
#
#         parts = name.split('.')
#         hierarchy[parts[0]].append(name)
#
#     # 显示层级结构
#     print(f"📊 模块统计 (排除内置模块): {sum(len(mods) for mods in hierarchy.values())} 个模块")
#     for base_package in sorted(hierarchy.keys()):
#         print(f"📦 {base_package}")
#         for module in sorted(hierarchy[base_package]):
#             module_obj = sys.modules[module]
#             file_info = getattr(module_obj, '__file__', '内置模块')
#             print(f"   └── {module} -> {file_info}")
#
#
# # 更精确的排除内置模块的方法
# def display_custom_modules():
#     """只显示第三方和自定义模块"""
#     hierarchy = defaultdict(list)
#
#     # 获取标准库路径
#     import os
#     stdlib_paths = [
#         os.path.abspath(sys.prefix),
#         os.path.abspath(sys.base_prefix),
#         os.path.dirname(os.__file__)  # os模块所在目录
#     ]
#
#     for name, module in sys.modules.items():
#         # 跳过没有文件路径的模块（通常是内置模块）
#         if not hasattr(module, '__file__') or module.__file__ is None:
#             continue
#
#         # 获取模块的绝对路径
#         module_path = os.path.abspath(module.__file__)
#
#         # 检查模块是否在标准库路径中
#         is_stdlib = any(module_path.startswith(stdlib_path) for stdlib_path in stdlib_paths)
#
#         # 只保留非标准库模块
#         if not is_stdlib:
#             parts = name.split('.')
#             hierarchy[parts[0]].append((name, module_path))
#
#     # 显示结果
#     print("=" * 60)
#     print("📊 第三方和自定义模块层级结构")
#     print("=" * 60)
#
#     total_modules = sum(len(mods) for mods in hierarchy.values())
#     print(f"总模块数: {total_modules}")
#     print()
#
#     for base_package in sorted(hierarchy.keys()):
#         print(f"📦 {base_package} ({len(hierarchy[base_package])} 个模块)")
#         for module_name, module_path in sorted(hierarchy[base_package]):
#             # 缩短路径显示，只显示最后两级目录
#             short_path = '/'.join(module_path.replace('\\', '/').split('/')[-2:])
#             print(f"   ├── {module_name}")
#             print(f"   │   └── {short_path}")
#         print()
#
#
# def display_third_party_modules():
#     """只显示第三方和自定义模块的简洁版本"""
#
#     # 获取标准库路径
#     stdlib_dirs = {
#         os.path.abspath(sys.prefix),
#         os.path.abspath(sys.base_prefix),
#         os.path.dirname(os.__file__),
#         os.path.dirname(sys.__file__)
#     }
#
#     hierarchy = defaultdict(list)
#     third_party_count = 0
#
#     for name, module in sys.modules.items():
#         # 跳过没有文件路径的模块
#         if not hasattr(module, '__file__') or not module.__file__:
#             continue
#
#         module_path = os.path.abspath(module.__file__)
#
#         # 检查是否为第三方模块（不在标准库路径中）
#         is_third_party = True
#         for stdlib_dir in stdlib_dirs:
#             if module_path.startswith(stdlib_dir):
#                 is_third_party = False
#                 break
#
#         if is_third_party:
#             parts = name.split('.')
#             hierarchy[parts[0]].append(name)
#             third_party_count += 1
#
#     # 显示结果
#     print(f"🎯 第三方和自定义模块 (共 {third_party_count} 个)")
#     print("=" * 50)
#
#     for base_package in sorted(hierarchy.keys()):
#         print(f"📦 {base_package}")
#         for module in sorted(hierarchy[base_package]):
#             print(f"   └── {module}")
#
#     return third_party_count
#
#
# # 使用示例
# if __name__ == "__main__":
#     print("方法1: 基本排除内置模块")
#     display_modules_hierarchically(exclude_builtin=True)
#
#     print("\n" + "=" * 60 + "\n")
#
#     print("方法2: 精确显示第三方和自定义模块")
#     display_custom_modules()
