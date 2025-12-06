class MinHeap {
	constructor() {
		this.heap = []
	}

	peek() {
		return this.heap[0]
	}

	push(item) {
		this.heap.push(item)
		this._bubbleUp(this.heap.length - 1)
	}

	pop() {
		if (this.heap.length === 1) return this.heap.pop()
		const top = this.heap[0]
		this.heap[0] = this.heap.pop()
		this._bubbleDown(0)
		return top
	}

	remove(id) {
		this.heap = this.heap.filter((item) => item.contestId !== id)
	}

	_bubbleUp(i) {
		while (i > 0) {
			const parent = Math.floor((i - 1) / 2)
			if (this.heap[parent].timestamp <= this.heap[i].timestamp) break
			;[this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]]
			i = parent
		}
	}

	_bubbleDown(i) {
		const length = this.heap.length
		while (true) {
			let left = 2 * i + 1
			let right = 2 * i + 2
			let smallest = i

			if (left < length && this.heap[left].timestamp < this.heap[smallest].timestamp) smallest = left
			if (right < length && this.heap[right].timestamp < this.heap[smallest].timestamp) smallest = right

			if (smallest === i) break
			;[this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]]
			i = smallest
		}
	}

	size() {
		return this.heap.length
	}
}

module.exports = MinHeap
