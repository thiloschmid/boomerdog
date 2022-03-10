/**
 *
 * @param n: number
 * @returns An array of arrays, with each array a partition of n.
 */
export function computePartitions(n: number) {
    const partitions = [[n]];

    for (let i = 1; i <= n / 2; i++) {
        let perm = computePartitions(n - i);
        for (const p of perm) {
            p[p.length - 1] >= i && partitions.push([...p, i]);
        }
    }
    return partitions;
}
