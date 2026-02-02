document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("saveBtn");
    const memoContent = document.getElementById("memoContent");
    const memoList = document.getElementById("memoList");

    let savedMemos = JSON.parse(localStorage.getItem("memos")) || [];

    renderMemoList();

    saveBtn.addEventListener("click", () => {
        const text = memoContent.value.trim();
        if (text === "") return;

        savedMemos.push(text);
        localStorage.setItem("memos", JSON.stringify(savedMemos));
        memoContent.value = "";
        renderMemoList();
    });

    function renderMemoList() {
        memoList.innerHTML = "";
        savedMemos.forEach((memo, index) => {
            const li = document.createElement("li");
            li.className = "memo-item";

            // メモ本文
            const memoText = document.createElement("span");
            memoText.textContent = memo;
            memoText.className = "memo-text";

            // 編集ボタン
            const editBtn = document.createElement("button");
            editBtn.textContent = "編集";
            editBtn.className = "edit-btn";
            editBtn.addEventListener("click", () => {
                const newText = prompt("編集内容を入力してください：", memo);
                if (newText !== null && newText.trim() !== "") {
                    savedMemos[index] = newText.trim();
                    localStorage.setItem("memos", JSON.stringify(savedMemos));
                    renderMemoList();
                }
            });

            // 削除ボタン
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "削除";
            deleteBtn.className = "delete-btn";
            deleteBtn.addEventListener("click", () => {
                if (confirm("このメモを削除しますか？")) {
                    savedMemos.splice(index, 1);
                    localStorage.setItem("memos", JSON.stringify(savedMemos));
                    renderMemoList();
                }
            });

            // ボタンを包むdiv
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "memo-actions";
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(memoText);
            li.appendChild(actionsDiv);
            memoList.appendChild(li);
        });
    }
});
